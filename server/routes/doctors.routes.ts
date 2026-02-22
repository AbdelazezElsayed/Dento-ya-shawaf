import { Router } from 'express';
import { storage } from '../storage';
import { logAudit } from '../utils/auditLogger';
import { requireAuth, requireAdmin, requireRole } from '../middleware/auth';

const router = Router();

// Get all doctors - public (for appointment booking)
router.get('/', async (_req, res) => {
    try {
        const doctors = await storage.getDoctors();
        // Only return public info
        const publicDoctors = doctors.map(d => ({
            id: d.id,
            fullName: d.fullName,
            specialization: d.specialization,
            clinicId: d.clinicId,
            rating: d.rating,
            reviewCount: d.reviewCount,
            isAvailable: d.isAvailable
        }));
        res.json(publicDoctors);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Get doctor by ID - public
router.get('/:id', async (req, res) => {
    try {
        const doctor = await storage.getDoctor(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                message: 'الطبيب غير موجود',
                messageEn: 'Doctor not found'
            });
        }
        // Return public info only
        res.json({
            id: doctor.id,
            fullName: doctor.fullName,
            specialization: doctor.specialization,
            clinicId: doctor.clinicId,
            rating: doctor.rating,
            reviewCount: doctor.reviewCount,
            isAvailable: doctor.isAvailable
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Create doctor - ADMIN ONLY
router.post('/', requireAdmin, async (req, res) => {
    try {
        const doctor = await storage.createDoctor(req.body);

        await logAudit({
            userId: req.session.userId!,
            action: 'CREATE_DOCTOR',
            entityType: 'Doctor',
            entityId: doctor.id,
            newData: { fullName: doctor.fullName },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.status(201).json(doctor);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Get doctor by user ID (for doctor's own profile)
router.get('/user/:userId', requireAuth, async (req, res) => {
    try {
        // Doctors can only get their own profile via userId
        if (req.session.userType !== 'admin' && req.session.userId !== req.params.userId) {
            return res.status(403).json({
                message: 'غير مصرح لك بالوصول لهذا الملف',
                messageEn: 'Not authorized to access this profile'
            });
        }

        const doctor = await storage.getDoctorByUserId(req.params.userId);
        if (!doctor) {
            return res.status(404).json({
                message: 'الطبيب غير موجود',
                messageEn: 'Doctor not found'
            });
        }
        res.json(doctor);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
