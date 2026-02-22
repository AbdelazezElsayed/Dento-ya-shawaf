import { Router } from 'express';
import { storage } from '../storage';
import { logAudit } from '../utils/auditLogger';
import {
    requireAuth,
    requireRole,
    requireMedicalStaff,
    validatePatientAccess,
    canAccessPatient,
    getPatientIdFromUserId,
    USER_TYPES
} from '../middleware/auth';
import { validateBody, validateParams, createPatientSchema, idParamSchema } from '../middleware/validation';

const router = Router();

// Get all patients - restricted by role
router.get('/', requireAuth, async (req, res) => {
    try {
        const userType = req.session.userType;
        const userId = req.session.userId!;

        // Patients can only see their own record
        if (userType === USER_TYPES.PATIENT || userType === USER_TYPES.STUDENT) {
            const patient = await storage.getPatientByUserId(userId);
            if (patient) {
                return res.json([patient]);
            }
            return res.json([]);
        }

        // Doctors, graduates, and admins can see all patients
        // For doctors, this could be further filtered to only their patients in a real scenario
        const patients = await storage.getPatients();
        res.json(patients);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Get patient by ID - with access control
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const patient = await storage.getPatient(req.params.id);
        if (!patient) {
            return res.status(404).json({
                message: 'المريض غير موجود',
                messageEn: 'Patient not found'
            });
        }

        // Check if user has access to this patient
        const hasAccess = await canAccessPatient(
            req.session.userId!,
            req.session.userType!,
            req.params.id
        );

        if (!hasAccess) {
            return res.status(403).json({
                message: 'غير مصرح لك بالوصول لبيانات هذا المريض',
                messageEn: 'You are not authorized to access this patient\'s data'
            });
        }

        res.json(patient);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Get patient by user ID - with access control
router.get('/user/:userId', requireAuth, async (req, res) => {
    try {
        const userType = req.session.userType;
        const currentUserId = req.session.userId!;
        const requestedUserId = req.params.userId;

        // Patients can only get their own record
        if ((userType === USER_TYPES.PATIENT || userType === USER_TYPES.STUDENT) &&
            currentUserId !== requestedUserId) {
            return res.status(403).json({
                message: 'غير مصرح لك بالوصول لبيانات مريض آخر',
                messageEn: 'You are not authorized to access another patient\'s data'
            });
        }

        const patient = await storage.getPatientByUserId(requestedUserId);
        if (!patient) {
            return res.status(404).json({
                message: 'المريض غير موجود',
                messageEn: 'Patient not found'
            });
        }

        res.json(patient);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Create patient - medical staff only
router.post('/', requireMedicalStaff, validateBody(createPatientSchema), async (req, res) => {
    try {
        const patient = await storage.createPatient(req.body);

        // Log patient creation
        await logAudit({
            userId: req.session.userId!,
            action: 'CREATE_PATIENT',
            entityType: 'Patient',
            entityId: patient.id,
            newData: { fullName: patient.fullName },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.status(201).json(patient);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Update patient - with access control
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const patient = await storage.getPatient(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'المريض غير موجود' });
        }

        // Check if user has access to this patient
        const hasAccess = await canAccessPatient(
            req.session.userId!,
            req.session.userType!,
            req.params.id
        );

        if (!hasAccess) {
            return res.status(403).json({
                message: 'غير مصرح لك بتعديل بيانات هذا المريض',
                messageEn: 'You are not authorized to update this patient\'s data'
            });
        }

        // Patients can only update certain fields
        const userType = req.session.userType;
        let updateData = req.body;
        if (userType === USER_TYPES.PATIENT || userType === USER_TYPES.STUDENT) {
            // Patients can only update phone, email, address
            updateData = {
                phone: req.body.phone,
                email: req.body.email,
                address: req.body.address
            };
        }

        // For now, use a simple update approach
        // In production, you would use storage.updatePatient()
        const { PatientModel } = await import('../mongodb');
        const updatedPatient = await PatientModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        await logAudit({
            userId: req.session.userId!,
            action: 'UPDATE_PATIENT',
            entityType: 'Patient',
            entityId: req.params.id,
            previousData: patient,
            newData: updateData,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.json(updatedPatient);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// ============================================
// TREATMENT PLAN ENDPOINTS
// ============================================

// Get treatment plan for a specific patient
router.get('/:patientId/treatment-plan', requireAuth, async (req, res) => {
    try {
        const { patientId } = req.params;
        const userId = req.session.userId!;
        const userType = req.session.userType!;

        // Check access: patient can only view their own, medical staff can view any
        if (userType === USER_TYPES.PATIENT) {
            const patient = await storage.getPatient(patientId);
            if (!patient || patient.userId !== userId) {
                return res.status(403).json({
                    message: 'غير مصرح بالوصول',
                    messageEn: 'Access denied'
                });
            }
        }

        const treatmentPlan = await storage.getTreatmentPlanByPatientId(patientId);

        if (!treatmentPlan) {
            return res.status(404).json({
                message: 'لم يتم العثور على خطة علاجية',
                messageEn: 'Treatment plan not found'
            });
        }

        res.json(treatmentPlan);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Update treatment plan for a patient (doctors only)
router.put('/:patientId/treatment-plan', requireMedicalStaff, async (req, res) => {
    try {
        const { patientId } = req.params;
        const userId = req.session.userId!;
        const {
            title,
            description,
            planStartDate,
            estimatedDuration,
            procedures,
            appointments,
            notes,
            status
        } = req.body;

        // Validate patient exists
        const patient = await storage.getPatient(patientId);
        if (!patient) {
            return res.status(404).json({
                message: 'المريض غير موجود',
                messageEn: 'Patient not found'
            });
        }

        // Get doctor info for doctorName
        const doctor = await storage.getDoctorByUserId(userId);
        const doctorName = doctor?.fullName || '';

        // Check if treatment plan exists
        const existingPlan = await storage.getTreatmentPlanByPatientId(patientId);

        let treatmentPlan;
        if (existingPlan) {
            // Update existing plan
            treatmentPlan = await storage.updateTreatmentPlan(existingPlan._id, {
                title,
                description,
                planStartDate,
                estimatedDuration,
                procedures: procedures || [],
                appointments: appointments || [],
                notes,
                status: status || 'active',
                doctorName,
                updatedAt: new Date()
            });

            await logAudit({
                userId,
                action: 'update_treatment_plan',
                entityType: 'treatment_plan',
                entityId: existingPlan._id
            });
        } else {
            // Create new treatment plan
            treatmentPlan = await storage.createTreatmentPlan({
                patientId,
                doctorId: userId,
                doctorName,
                title,
                description,
                planStartDate,
                estimatedDuration,
                procedures: procedures || [],
                appointments: appointments || [],
                notes,
                status: status || 'active',
                updatedAt: new Date()
            });

            await logAudit({
                userId,
                action: 'create_treatment_plan',
                entityType: 'treatment_plan',
                entityId: treatmentPlan._id
            });
        }

        res.json({
            success: true,
            message: 'تم حفظ الخطة العلاجية بنجاح',
            messageEn: 'Treatment plan saved successfully',
            data: treatmentPlan
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
