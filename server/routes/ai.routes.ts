import { Router } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validateBody, aiDiagnosisSchema } from '../middleware/validation';
import { logAudit } from '../utils/auditLogger';
import logger from '../utils/logger';
import { upload, uploadToGridFS } from '../utils/gridfsStorage';
import { DiagnosisRecordModel } from '../mongodb';

const router = Router();

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// Medical disclaimer that must be included in all AI responses
const MEDICAL_DISCLAIMER = {
    ar: {
        warning: "⚠️ تنبيه طبي مهم",
        text: "هذا تقييم أولي بواسطة الذكاء الاصطناعي فقط وليس تشخيصًا طبيًا رسميًا. يجب مراجعة طبيب أسنان مرخص قبل اتخاذ أي قرارات علاجية. لا تعتمد على هذا التقييم كبديل عن الاستشارة الطبية المتخصصة.",
        requirement: "يجب على طبيب أسنان مرخص مراجعة هذا التقييم قبل أي علاج."
    },
    en: {
        warning: "⚠️ Important Medical Notice",
        text: "This is a preliminary AI-assisted assessment only and NOT an official medical diagnosis. You must consult a licensed dental professional before making any treatment decisions. Do not rely on this assessment as a substitute for professional medical advice.",
        requirement: "A licensed dental professional must review this assessment before any treatment."
    }
};

// ============================================
// SECURITY: Input Validation Constants
// ============================================
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_SYMPTOM_LENGTH = 5000;
const MAX_CHAT_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION_HISTORY = 10; // Limit context size

/**
 * Sanitize user input to prevent prompt injection
 */
function sanitizeInput(input: string): string {
    if (!input) return '';
    // Remove potential prompt injection patterns
    return input
        .replace(/ignore.*previous.*instructions/gi, '[filtered]')
        .replace(/disregard.*above/gi, '[filtered]')
        .replace(/system.*prompt/gi, '[filtered]')
        .replace(/```/g, '') // Remove code blocks
        .slice(0, MAX_SYMPTOM_LENGTH); // Limit length
}

/**
 * Validate and parse base64 image data
 */
function validateImage(xrayImage: string): { valid: boolean; error?: string; data?: string; mimeType?: string } {
    if (!xrayImage || !xrayImage.includes('base64,')) {
        return { valid: false, error: 'Invalid image format' };
    }

    const parts = xrayImage.split('base64,');
    if (parts.length !== 2) {
        return { valid: false, error: 'Invalid base64 format' };
    }

    const base64Data = parts[1];
    const mimeMatch = xrayImage.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : '';

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return { valid: false, error: `Invalid image type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` };
    }

    // Validate size (base64 is ~33% larger than binary)
    const estimatedBytes = (base64Data.length * 3) / 4;
    if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
        return { valid: false, error: `Image too large (max ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB)` };
    }

    return { valid: true, data: base64Data, mimeType };
}

// ============================================
// GENERAL CHAT ENDPOINT (New)
// ============================================

const chatSchema = z.object({
    message: z.string().min(1).max(MAX_CHAT_MESSAGE_LENGTH),
    conversationHistory: z.array(z.object({
        role: z.enum(['user', 'bot']),
        content: z.string()
    })).max(MAX_CONVERSATION_HISTORY).optional(),
    language: z.enum(['ar', 'en']).default('ar'),
    image: z.string().optional().nullable(),
});

router.post('/chat', validateBody(chatSchema), async (req, res) => {
    const startTime = Date.now();

    try {
        const { message, conversationHistory = [], language = 'ar', image } = req.body;
        const userId = req.session?.userId || null; // Optional - works for both logged-in and anonymous users

        // Log chat request (userId can be null for anonymous users)
        if (userId) {
            await logAudit({
                userId,
                action: 'AI_CHAT_REQUEST',
                entityType: 'AIChat',
                entityId: null,
                newData: {
                    hasImage: !!image,
                    language,
                    historyLength: conversationHistory.length
                },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] as string,
            });
        }

        if (!genAI) {
            logger.warn('AI chat requested but GEMINI_API_KEY not configured');
            return res.status(503).json({
                success: false,
                message: 'خدمة الذكاء الاصطناعي غير متاحة حالياً',
                messageEn: 'AI service not available. Please configure GEMINI_API_KEY.',
            });
        }

        // Sanitize input
        const sanitizedMessage = sanitizeInput(message);

        // Validate image if provided
        let validatedImage: { data: string; mimeType: string } | null = null;
        if (image) {
            const imageValidation = validateImage(image);
            if (!imageValidation.valid) {
                return res.status(400).json({
                    success: false,
                    message: imageValidation.error,
                    messageEn: imageValidation.error,
                });
            }
            validatedImage = { data: imageValidation.data!, mimeType: imageValidation.mimeType! };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Build conversation context
        const contextMessages = conversationHistory
            .slice(-MAX_CONVERSATION_HISTORY)
            .map((msg: { role: string; content: string }) => `${msg.role === 'user' ? 'المريض' : 'المساعد'}: ${msg.content}`)
            .join('\n');

        const systemPrompt = `أنت مساعد طبي ذكي لعيادة أسنان جامعة الدلتا للعلوم والتكنولوجيا.
        
مهامك:
1. الإجابة على أسئلة المرضى حول خدمات العيادة، المواعيد، الأسعار، والأطباء
2. تقييم الأعراض وتوجيه المريض للعيادة المناسبة
3. تقديم نصائح صحية عامة للعناية بالأسنان
4. التحدث بلغة ${language === 'ar' ? 'عربية' : 'إنجليزية'} واضحة ومهنية

العيادات المتاحة:
- التشخيص والأشعة: للفحص الشامل والأشعة
- العلاج التحفظي: للحشوات وعلاج التسوس
- جراحة الفم والفكين: للخلع والعمليات الجراحية
- تقويم الأسنان: لتصحيح اعوجاج الأسنان
- زراعة الأسنان: لتعويض الأسنان المفقودة
- تجميل الأسنان: للتبييض وتحسين المظهر
- أسنان الأطفال: للأطفال أقل من 12 سنة
- اللثة: لعلاج أمراض اللثة
- التركيبات الثابتة: للتيجان والجسور
- التركيبات المتحركة: لأطقم الأسنان

معلومات مهمة:
- ساعات العمل: 8 صباحاً - 8 مساءً (السبت-الخميس)
- رسوم الفحص الأساسي: 500 جنيه مصري
- يمكن حجز المواعيد من خلال التطبيق
- نقبل معظم شركات التأمين الطبي

تعليمات الرد:
- كن مفيداً ومهنياً
- إذا سأل عن أعراض، قيّمها واقترح العيادة المناسبة
- إذا كانت حالة طارئة، انصحه بالذهاب فوراً
- لا تقدم تشخيصاً طبياً نهائياً، فقط توجيه أولي
- اقترح دائماً زيارة الطبيب للفحص الدقيق

${contextMessages ? `المحادثة السابقة:\n${contextMessages}\n` : ''}

المريض الآن: ${sanitizedMessage}

قدم رد مفيد ومهني. إذا كانت الأعراض تحتاج عيادة معينة، اذكرها بوضوح.`;

        let result;
        if (validatedImage) {
            const imagePart = {
                inlineData: {
                    data: validatedImage.data,
                    mimeType: validatedImage.mimeType
                }
            };
            result = await model.generateContent([systemPrompt, imagePart]);
        } else {
            result = await model.generateContent(systemPrompt);
        }

        const responseText = result.response.text();

        // Extract suggested clinic if mentioned
        const clinicKeywords: Record<string, string> = {
            'تشخيص': 'التشخيص والأشعة',
            'أشعة': 'التشخيص والأشعة',
            'تحفظي': 'العلاج التحفظي',
            'حشو': 'العلاج التحفظي',
            'تسوس': 'العلاج التحفظي',
            'جراحة': 'جراحة الفم والفكين',
            'خلع': 'جراحة الفم والفكين',
            'تقويم': 'تقويم الأسنان',
            'زراعة': 'زراعة الأسنان',
            'تجميل': 'تجميل الأسنان',
            'تبييض': 'تجميل الأسنان',
            'أطفال': 'أسنان الأطفال',
            'لثة': 'اللثة',
            'تركيبات ثابتة': 'التركيبات الثابتة',
            'تركيبات متحركة': 'التركيبات المتحركة',
        };

        let suggestedClinic: string | null = null;
        const lowerResponse = responseText.toLowerCase();
        for (const [keyword, clinic] of Object.entries(clinicKeywords)) {
            if (lowerResponse.includes(keyword)) {
                suggestedClinic = clinic;
                break;
            }
        }

        const responseData = {
            message: responseText,
            suggestedClinic,
            language,
            timestamp: new Date().toISOString(),
            processingTimeMs: Date.now() - startTime
        };

        // Log successful chat (only if user is logged in)
        if (userId) {
            await logAudit({
                userId,
                action: 'AI_CHAT_COMPLETE',
                entityType: 'AIChat',
                entityId: null,
                newData: {
                    hasSuggestion: !!suggestedClinic,
                    processingTimeMs: Date.now() - startTime
                },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] as string,
            });
        }

        res.json(responseData);
    } catch (err: any) {
        logger.error('AI Chat error:', err);

        const language = req.body?.language || 'ar';
        res.status(500).json({
            success: false,
            message: language === 'ar' ? 'حدث خطأ في معالجة الرسالة' : 'Error processing message',
            messageEn: err.message,
        });
    }
});

// AI Diagnosis - NOW PROTECTED WITH AUTH
router.post('/diagnosis', requireAuth, validateBody(aiDiagnosisSchema), async (req, res) => {
    const startTime = Date.now();

    try {
        const { answers, symptomSummary, xrayImage, language = 'ar', patientId } = req.body;
        let xrayFileId: string | null = null;
        let storedXrayFilename: string | null = null;
        const userId = req.session.userId!;

        // Log the AI request (without sensitive image data)
        await logAudit({
            userId,
            action: 'AI_DIAGNOSIS_REQUEST',
            entityType: 'AIDiagnosis',
            entityId: null,
            newData: {
                hasImage: !!xrayImage,
                language,
                answersCount: Object.keys(answers || {}).length,
                hasSummary: !!symptomSummary
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        if (!genAI) {
            logger.warn('AI diagnosis requested but GEMINI_API_KEY not configured');
            return res.status(503).json({
                success: false,
                message: 'AI service not available. Please configure GEMINI_API_KEY.',
                messageEn: 'AI service not available. Please configure GEMINI_API_KEY.',
                fallback: true,
                disclaimer: MEDICAL_DISCLAIMER[language as 'ar' | 'en'] || MEDICAL_DISCLAIMER.en
            });
        }

        // SECURITY: Validate image if provided
        let validatedImage: { data: string; mimeType: string } | null = null;
        if (xrayImage) {
            const imageValidation = validateImage(xrayImage);
            if (!imageValidation.valid) {
                return res.status(400).json({
                    success: false,
                    message: imageValidation.error,
                    messageEn: imageValidation.error,
                });
            }
            validatedImage = { data: imageValidation.data!, mimeType: imageValidation.mimeType! };

            // Upload to GridFS
            try {
                const buffer = Buffer.from(validatedImage.data, 'base64');
                const extension = validatedImage.mimeType.split('/')[1] || 'jpg';
                storedXrayFilename = `xray-${userId}-${Date.now()}.${extension}`;
                xrayFileId = await uploadToGridFS(buffer, storedXrayFilename, { userId, mimeType: validatedImage.mimeType });
            } catch (uploadError) {
                logger.error('Failed to upload X-ray to GridFS:', uploadError);
                // Continue without file ID
            }
        }

        // SECURITY: Sanitize user input to prevent prompt injection
        const sanitizedSummary = sanitizeInput(symptomSummary || '');
        const sanitizedAnswers = Object.entries(answers || {})
            .map(([key, value]) => `${sanitizeInput(key)}: ${sanitizeInput(String(value))}`)
            .join('\n');

        const description = sanitizedSummary || sanitizedAnswers;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a professional dental diagnosis assistant powered by Google Gemini. 
        Your task is to analyze patient symptoms and optionally an X-ray image to provide a preliminary dental diagnosis.
        
        CRITICAL INSTRUCTIONS:
        1. Accuracy: Be as accurate as possible based on the provided information.
        2. Language: Use ${language === 'ar' ? 'Arabic' : 'English'} for all display text (names, descriptions, recommendations).
        3. Schema: You MUST respond with a valid JSON object matching the following structure exactly:
        {
          "conditions": [
            {
              "name": "Human readable name",
              "nameEn": "English name",
              "conditionKey": "one_of_the_keys_below",
              "probability": number (0-100),
              "description": "Short explanation of the condition and why you diagnosed it"
            }
          ],
          "recommendations": ["Actionable advice 1", "Actionable advice 2"],
          "urgency": "high" | "medium" | "low",
          "confidence": number (0-100),
          "suggestedClinic": {
            "id": "clinic_id",
            "name": "Clinic Name",
            "nameAr": "اسم العيادة بالعربية",
            "nameEn": "Clinic Name in English"
          },
          "estimatedTreatmentTime": "e.g., 30-45 mins"
        }
        
        ALLOWED conditionKeys: dental_caries, gingivitis, tooth_sensitivity, root_canal, extraction, orthodontic, cosmetic, implant, pediatric, periodontitis, dentures, crowns
        
        CLINIC MAPPING (suggestedClinic.id):
        - diagnosis (Diagnostic)
        - conservative (Conservative/Filling)
        - surgery (Oral Surgery)
        - removable (Removable Prosthetics)
        - fixed (Fixed Prosthetics)
        - gums (Periodontics)
        - cosmetic (Cosmetic)
        - implants (Implants)
        - orthodontics (Orthodontics)
        - pediatric (Pediatric)

        Patient Information:
        ${description}
        
        Please provide a detailed and professional analysis.`;

        let result;
        if (validatedImage) {
            // Use pre-validated image data
            const imagePart = {
                inlineData: {
                    data: validatedImage.data,
                    mimeType: validatedImage.mimeType
                }
            };

            result = await model.generateContent([prompt, imagePart]);
        } else {
            result = await model.generateContent(prompt);
        }

        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();

        // Zod schema for validating AI response structure
        const diagnosisResponseSchema = z.object({
            conditions: z.array(z.object({
                name: z.string().default('Unknown Condition'),
                nameEn: z.string().optional(),
                conditionKey: z.string().default('unknown'),
                probability: z.number().min(0).max(100).default(50),
                description: z.string().default('')
            })).default([]),
            recommendations: z.array(z.string()).default([]),
            urgency: z.enum(['high', 'medium', 'low']).default('medium'),
            confidence: z.number().min(0).max(100).default(50),
            suggestedClinic: z.object({
                id: z.string(),
                name: z.string(),
                nameAr: z.string().optional(),
                nameEn: z.string().optional()
            }).optional(),
            estimatedTreatmentTime: z.string().optional()
        });

        try {
            const parsed = JSON.parse(cleanedText);

            // Validate and apply defaults for malformed responses
            const validationResult = diagnosisResponseSchema.safeParse(parsed);
            const diagnosis = validationResult.success
                ? validationResult.data
                : diagnosisResponseSchema.parse({}); // Use defaults if validation fails

            if (!validationResult.success) {
                logger.warn('AI response validation failed, using defaults:', validationResult.error);
            }

            // Add medical disclaimer to response
            const disclaimer = MEDICAL_DISCLAIMER[language as 'ar' | 'en'] || MEDICAL_DISCLAIMER.en;

            // Flag for human review if confidence is low or urgency is high
            const requiresHumanReview = diagnosis.confidence < 70 || diagnosis.urgency === 'high';

            const responseData = {
                ...diagnosis,
                disclaimer,
                requiresHumanReview,
                generatedAt: new Date().toISOString(),
                processingTimeMs: Date.now() - startTime
            };

            // Log successful diagnosis (without PII)
            await logAudit({
                userId,
                action: 'AI_DIAGNOSIS_COMPLETE',
                entityType: 'AIDiagnosis',
                entityId: null,
                newData: {
                    confidence: diagnosis.confidence,
                    urgency: diagnosis.urgency,
                    conditionsCount: diagnosis.conditions?.length || 0,
                    requiresHumanReview,
                    processingTimeMs: Date.now() - startTime
                },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] as string,
            });

            // Save diagnosis record to database for historical tracking
            try {
                const diagnosisRecord = await DiagnosisRecordModel.create({
                    userId,
                    patientId: patientId || null, // Link to patient record if available
                    answers: answers,
                    conditions: diagnosis.conditions,
                    recommendations: diagnosis.recommendations,
                    urgency: diagnosis.urgency,
                    confidence: diagnosis.confidence,
                    suggestedClinic: diagnosis.suggestedClinic,
                    estimatedTreatmentTime: diagnosis.estimatedTreatmentTime || null,
                    xrayFileId: xrayFileId || null,
                    xrayFilename: storedXrayFilename,
                    createdAt: new Date()
                });

                logger.info(`Diagnosis record saved: ${diagnosisRecord._id} for user ${userId}`);

                // Add record ID to response for reference
                (responseData as any).diagnosisRecordId = diagnosisRecord._id.toString();
            } catch (dbError) {
                // Don't fail the request if database save fails, just log it
                logger.error('Failed to save diagnosis record to database:', dbError);
                // Continue and send response anyway
            }

            res.json(responseData);
        } catch (parseError) {
            logger.error('Failed to parse Gemini response:', { responseText, error: parseError });

            await logAudit({
                userId,
                action: 'AI_DIAGNOSIS_PARSE_ERROR',
                entityType: 'AIDiagnosis',
                entityId: null,
                newData: { error: 'Failed to parse AI response' },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] as string,
            });

            throw new Error('Invalid response format from AI');
        }
    } catch (err: any) {
        logger.error('AI Diagnosis error:', err);

        const language = req.body?.language || 'ar';
        res.status(500).json({
            success: false,
            message: language === 'ar' ? 'حدث خطأ في معالجة التشخيص' : 'Error processing diagnosis',
            messageEn: err.message,
            disclaimer: MEDICAL_DISCLAIMER[language as 'ar' | 'en'] || MEDICAL_DISCLAIMER.en
        });
    }
});

// ============================================
// SERVE X-RAY IMAGE FROM GRIDFS
// ============================================
router.get('/xray/:fileId', requireAuth, async (req, res) => {
    try {
        const { fileId } = req.params;
        const { downloadFromGridFS } = await import('../utils/gridfsStorage');

        const { buffer, metadata, filename } = await downloadFromGridFS(fileId);

        // Security: Verify user owns this X-ray
        if (metadata?.userId !== req.session.userId && req.session.userType !== 'admin') {
            return res.status(403).json({
                message: 'غير مصرح لك بالوصول لهذه الصورة',
                messageEn: 'Access denied'
            });
        }

        res.setHeader('Content-Type', metadata?.mimeType || 'image/jpeg');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Cache-Control', 'private, max-age=3600');
        res.send(buffer);
    } catch (error: any) {
        logger.error('Error serving X-ray:', error);
        res.status(404).json({
            message: 'الصورة غير موجودة',
            messageEn: 'Image not found'
        });
    }
});

export default router;
