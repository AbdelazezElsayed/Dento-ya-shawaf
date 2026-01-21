import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { storage } from '../storage';
import { validateBody, loginSchema, registerSchema } from '../middleware/validation';
import { logAudit } from '../utils/auditLogger';

const router = Router();

declare module 'express-session' {
    interface SessionData {
        userId?: string;
        userType?: string;
    }
}

// Register
router.post('/register', validateBody(registerSchema), async (req, res) => {
    try {
        const { username, password, fullName, email, phone, userType, specialization, clinicId } = req.body;

        // SECURITY: Prevent self-registration as admin
        if (userType === 'admin') {
            return res.status(403).json({
                message: 'لا يمكن التسجيل كمسؤول. يرجى التواصل مع إدارة النظام.',
                messageEn: 'Admin registration not allowed. Please contact system administration.'
            });
        }

        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await storage.createUser({
            username,
            password: hashedPassword,
            fullName,
            email: email || null,
            phone: phone || null,
            userType: userType || 'patient',
        });

        // Create doctor/patient record based on userType
        if (userType === 'doctor' || userType === 'graduate') {
            await storage.createDoctor({
                userId: newUser.id,
                fullName,
                specialization: specialization || 'General Dentistry',
                clinicId: clinicId || null,
                rating: 0,
                reviewCount: 0,
                isAvailable: true,
            });
        } else if (userType === 'patient' || userType === 'student') {
            await storage.createPatient({
                assignedToUserId: newUser.id,
                fullName,
                phone: phone || null,
                clinicId: clinicId || null,
            });
        }

        req.session.userId = newUser.id;
        req.session.userType = newUser.userType;

        const { password: _, ...userWithoutPassword } = newUser;

        // Log registration
        await logAudit({
            userId: newUser.id,
            action: 'REGISTER',
            entityType: 'User',
            entityId: newUser.id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.status(201).json(userWithoutPassword);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Login
router.post('/login', validateBody(loginSchema), async (req, res) => {
    try {
        const { email, password, userType } = req.body;
        const user = await storage.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ 
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
                messageEn: 'Invalid email or password'
            });
        }

        // Validate user type if provided
        if (userType && user.userType !== userType) {
            return res.status(401).json({ 
                message: 'نوع المستخدم المختار لا يتطابق مع الحساب المسجل',
                messageEn: 'Selected user type does not match the registered account'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        // SECURITY: Regenerate session to prevent session fixation attacks
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({ message: 'خطأ في إنشاء الجلسة' });
            }

            req.session.userId = user.id;
            req.session.userType = user.userType;

            const { password: _, ...userWithoutPassword } = user;

            // Log login
            logAudit({
                userId: user.id,
                action: 'LOGIN',
                entityType: 'User',
                entityId: user.id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] as string,
            }).catch(console.error); // Don't block response on audit log failure

            req.session.save(() => {
                res.json(userWithoutPassword);
            });
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    const userId = req.session.userId;

    if (userId) {
        // Log logout before session destroy
        await logAudit({
            userId,
            action: 'LOGOUT',
            entityType: 'User',
            entityId: userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });
    }

    // SECURITY: Regenerate session after logout to prevent session reuse
    req.session.regenerate((err) => {
        if (err) {
            // If regeneration fails, at least clear the session data
            req.session.destroy(() => {
                res.clearCookie('connect.sid'); // Default session cookie name
                res.json({ message: 'تم تسجيل الخروج بنجاح' });
            });
        } else {
            res.clearCookie('connect.sid');
            res.json({ message: 'تم تسجيل الخروج بنجاح' });
        }
    });
});

// Get current user
router.get('/me', async (req, res) => {
    if (!req.session?.userId) {
        return res.status(401).json({ message: 'غير مسجل الدخول' });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

export default router;
