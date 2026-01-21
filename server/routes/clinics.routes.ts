import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

const router = Router();

// Get all clinics - public (for UI listings)
router.get('/', async (_req, res) => {
    try {
        const clinics = await storage.getClinics();
        res.json(clinics);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Get clinic by ID - public
router.get('/:id', async (req, res) => {
    try {
        const clinic = await storage.getClinic(req.params.id);
        if (!clinic) {
            return res.status(404).json({
                message: 'العيادة غير موجودة',
                messageEn: 'Clinic not found'
            });
        }
        res.json(clinic);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Create clinic - ADMIN ONLY
router.post('/', requireAdmin, async (req, res) => {
    try {
        const clinic = await storage.createClinic(req.body);

        await logAudit({
            userId: req.session.userId!,
            action: 'CREATE_CLINIC',
            entityType: 'Clinic',
            entityId: clinic.id,
            newData: { name: clinic.name },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.status(201).json(clinic);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
