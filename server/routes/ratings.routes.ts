import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import logger from '../utils/logger';

const router = Router();

// Validation schema for creating a rating
const createRatingSchema = z.object({
    doctorId: z.string().min(1, 'Doctor ID is required'),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1, 'Comment is required').max(1000, 'Comment too long')
});

// Get all ratings
router.get('/', async (_req, res) => {
    try {
        const ratings = await storage.getRatings();
        res.json(ratings);
    } catch (err: any) {
        logger.error('Error fetching ratings:', err);
        res.status(500).json({ message: 'Failed to fetch ratings', error: err.message });
    }
});

// Get ratings by doctor
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        const ratings = await storage.getRatingsByDoctor(doctorId);
        res.json(ratings);
    } catch (err: any) {
        logger.error(`Error fetching ratings for doctor ${req.params.doctorId}:`, err);
        res.status(500).json({ message: 'Failed to fetch doctor ratings', error: err.message });
    }
});

// Get ratings by patient
router.get('/patient/:patientId', requireAuth, async (req, res) => {
    try {
        const { patientId } = req.params;

        // Only allow users to see their own ratings or allow admins/staff
        if (req.session.userId !== patientId && req.session.userType !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const ratings = await storage.getRatingsByPatient(patientId);
        res.json(ratings);
    } catch (err: any) {
        logger.error(`Error fetching ratings for patient ${req.params.patientId}:`, err);
        res.status(500).json({ message: 'Failed to fetch patient ratings', error: err.message });
    }
});

// Create a new rating
router.post('/', requireAuth, validateBody(createRatingSchema), async (req, res) => {
    try {
        const { doctorId, rating, comment } = req.body;
        const patientId = req.session.userId;

        if (!patientId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // TODO: Optional - Check if patient has an appointment with this doctor
        // const hasAppointment = await storage.hasPatientAppointmentWithDoctor(patientId, doctorId);
        // if (!hasAppointment) {
        //   return res.status(403).json({ message: 'You can only rate doctors you have visited' });
        // }

        const newRating = await storage.createRating({
            doctorId,
            patientId,
            rating,
            comment,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        logger.info(`Rating created: ${newRating.id} by patient ${patientId} for doctor ${doctorId}`);
        res.status(201).json(newRating);
    } catch (err: any) {
        logger.error('Error creating rating:', err);
        res.status(400).json({ message: 'Failed to create rating', error: err.message });
    }
});

// Update a rating (only by the rating author)
router.put('/:id', requireAuth, validateBody(createRatingSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.session.userId;

        const existingRating = await storage.getRatingById(id);
        if (!existingRating) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        // Only allow the rating author to update
        if (existingRating.patientId !== userId) {
            return res.status(403).json({ message: 'You can only update your own ratings' });
        }

        const updatedRating = await storage.updateRating(id, {
            rating,
            comment,
            updatedAt: new Date()
        });

        logger.info(`Rating updated: ${id} by patient ${userId}`);
        res.json(updatedRating);
    } catch (err: any) {
        logger.error(`Error updating rating ${req.params.id}:`, err);
        res.status(400).json({ message: 'Failed to update rating', error: err.message });
    }
});

// Delete a rating (soft delete)
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const existingRating = await storage.getRatingById(id);
        if (!existingRating) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        // Only allow the rating author or admin to delete
        if (existingRating.patientId !== userId && req.session.userType !== 'admin') {
            return res.status(403).json({ message: 'You can only delete your own ratings' });
        }

        await storage.deleteRating(id);
        logger.info(`Rating deleted: ${id} by user ${userId}`);
        res.json({ message: 'Rating deleted successfully' });
    } catch (err: any) {
        logger.error(`Error deleting rating ${req.params.id}:`, err);
        res.status(400).json({ message: 'Failed to delete rating', error: err.message });
    }
});

export default router;
