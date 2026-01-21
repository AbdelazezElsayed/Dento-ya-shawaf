import { Router } from 'express';
import { storage } from '../storage';
import { logAudit } from '../utils/auditLogger';
import {
    requireAuth,
    requireRole,
    requireDoctor,
    requireMedicalStaff,
    getPatientIdFromUserId,
    getDoctorIdFromUserId
} from '../middleware/auth';

const router = Router();

// ============================================
// VISIT SESSIONS
// ============================================

// Changed: Students can view but only doctors can manage
router.get('/visit-sessions', requireMedicalStaff, async (_req, res) => {
    try {
        const sessions = await storage.getVisitSessions();
        res.json(sessions);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/visit-sessions/patient/:patientId', requireAuth, async (req, res) => {
    try {
        const userType = req.session.userType;
        if (userType === 'patient' || userType === 'student') {
            const myPatientId = await getPatientIdFromUserId(req.session.userId!);
            if (req.params.patientId !== myPatientId) {
                return res.status(403).json({ message: 'غير مصرح لك بعرض جلسات مريض آخر' });
            }
        }
        const sessions = await storage.getVisitSessionsByPatient(req.params.patientId);
        res.json(sessions);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/visit-sessions', requireRole('doctor', 'graduate'), async (req, res) => {
    try {
        const session = await storage.createVisitSession(req.body);

        // Log visit session creation
        await logAudit({
            userId: req.session.userId!,
            action: 'CREATE_VISIT_SESSION',
            entityType: 'VisitSession',
            entityId: session.id,
            newData: session,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.status(201).json(session);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/visit-sessions/:id/attend', requireRole('doctor', 'graduate', 'student'), async (req, res) => {
    try {
        const existingSession = await storage.getVisitSession(req.params.id);
        if (!existingSession) {
            return res.status(404).json({ message: 'الجلسة غير موجودة' });
        }
        const myDoctorId = await getDoctorIdFromUserId(req.session.userId!);
        if (existingSession.doctorId !== myDoctorId) {
            return res.status(403).json({ message: 'غير مصرح لك بتعديل هذه الجلسة' });
        }
        const session = await storage.updateVisitSession(req.params.id, {
            attendanceStatus: 'attended'
        });
        res.json(session);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// ============================================
// PAYMENTS
// ============================================

router.get('/payments', requireRole('doctor', 'student', 'graduate'), async (_req, res) => {
    try {
        const payments = await storage.getPayments();
        res.json(payments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/payments/patient/:patientId', requireAuth, async (req, res) => {
    try {
        const userType = req.session.userType;
        if (userType === 'patient' || userType === 'student') {
            const myPatientId = await getPatientIdFromUserId(req.session.userId!);
            if (req.params.patientId !== myPatientId) {
                return res.status(403).json({ message: 'غير مصرح لك بعرض مدفوعات مريض آخر' });
            }
        }
        const payments = await storage.getPaymentsByPatient(req.params.patientId);
        res.json(payments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// SECURITY: Only doctors can create payments (not students)
router.post('/payments', requireDoctor, async (req, res) => {
    try {
        const payment = await storage.createPayment(req.body);

        // Log payment creation
        await logAudit({
            userId: req.session.userId!,
            action: 'CREATE_PAYMENT',
            entityType: 'Payment',
            entityId: payment.id,
            newData: payment,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.status(201).json(payment);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// ============================================
// PATIENT BALANCE
// ============================================

router.get('/patient/:patientId/balance', requireAuth, async (req, res) => {
    try {
        const userType = req.session.userType;
        if (userType === 'patient' || userType === 'student') {
            const myPatientId = await getPatientIdFromUserId(req.session.userId!);
            if (req.params.patientId !== myPatientId) {
                return res.status(403).json({ message: 'غير مصرح لك بعرض رصيد مريض آخر' });
            }
        }
        const balance = await storage.getPatientBalance(req.params.patientId);
        res.json(balance);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// CLINIC PRICES
// ============================================

router.get('/clinic-prices', requireAuth, async (_req, res) => {
    try {
        const prices = await storage.getClinicPrices();
        res.json(prices);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/clinic-prices/:clinicId', requireAuth, async (req, res) => {
    try {
        const price = await storage.getClinicPrice(req.params.clinicId);
        res.json(price || { sessionPrice: "500" });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/clinic-prices/:clinicId', requireRole('doctor'), async (req, res) => {
    try {
        const price = await storage.upsertClinicPrice({
            clinicId: req.params.clinicId,
            sessionPrice: req.body.sessionPrice,
            updatedBy: req.session?.userId || null,
        });

        // Log clinic price update
        await logAudit({
            userId: req.session.userId!,
            action: 'UPDATE_CLINIC_PRICE',
            entityType: 'ClinicPrice',
            entityId: price.id,
            newData: price,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.json(price);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
