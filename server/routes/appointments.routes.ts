import { Router } from 'express';
import { storage } from '../storage';
import { logAudit } from '../utils/auditLogger';
import {
    requireAuth,
    requireRole,
    requireMedicalStaff,
    getPatientIdFromUserId,
    getDoctorIdFromUserId
} from '../middleware/auth';

const router = Router();

// Get all appointments (filtered by role)
router.get('/', requireAuth, async (req, res) => {
    try {
        const userType = req.session.userType;

        if (userType === 'patient' || userType === 'student') {
            const patient = await storage.getPatientByUserId(req.session.userId!);
            if (patient) {
                const appointments = await storage.getAppointmentsByPatient(patient.id);
                return res.json(appointments);
            }
            return res.json([]);
        }

        if (['doctor', 'graduate'].includes(userType || '')) {
            const doctor = await storage.getDoctorByUserId(req.session.userId!);
            if (doctor) {
                const appointments = await storage.getAppointmentsByDoctor(doctor.id);
                return res.json(appointments);
            }
            return res.json([]);
        }

        const allAppointments = await storage.getAppointments();
        res.json(allAppointments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Get appointment by ID
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const appointment = await storage.getAppointment(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'الموعد غير موجود' });
        }

        const userType = req.session.userType;
        if (userType === 'patient' || userType === 'student') {
            const patientId = await getPatientIdFromUserId(req.session.userId!);
            if (appointment.patientId !== patientId) {
                return res.status(403).json({ message: 'غير مصرح لك بعرض هذا الموعد' });
            }
        }
        if (['doctor', 'graduate'].includes(userType || '')) {
            const doctorId = await getDoctorIdFromUserId(req.session.userId!);
            if (appointment.doctorId !== doctorId) {
                return res.status(403).json({ message: 'غير مصرح لك بعرض هذا الموعد' });
            }
        }

        res.json(appointment);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Get appointments by patient
router.get('/patient/:patientId', requireAuth, async (req, res) => {
    try {
        const userType = req.session.userType;
        if (userType === 'patient' || userType === 'student') {
            const myPatientId = await getPatientIdFromUserId(req.session.userId!);
            if (req.params.patientId !== myPatientId) {
                return res.status(403).json({ message: 'غير مصرح لك بعرض مواعيد مريض آخر' });
            }
        }
        const appointments = await storage.getAppointmentsByPatient(req.params.patientId);
        res.json(appointments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Get appointments by doctor
router.get('/doctor/:doctorId', requireRole('doctor', 'student', 'graduate'), async (req, res) => {
    try {
        const myDoctorId = await getDoctorIdFromUserId(req.session.userId!);
        if (req.params.doctorId !== myDoctorId) {
            return res.status(403).json({ message: 'غير مصرح لك بعرض مواعيد طبيب آخر' });
        }
        const appointments = await storage.getAppointmentsByDoctor(req.params.doctorId);
        res.json(appointments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Get today's appointments for doctor
router.get('/doctor/today', requireRole('doctor', 'student', 'graduate'), async (req, res) => {
    try {
        const doctor = await storage.getDoctorByUserId(req.session.userId!);
        if (!doctor) {
            return res.json([]);
        }
        const today = new Date().toISOString().split('T')[0];
        const appointments = await storage.getAppointmentsByDoctorAndDate(doctor.id, today);
        res.json(appointments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Create appointment
router.post('/', requireAuth, async (req, res) => {
    try {
        const appointmentData = { ...req.body };
        const userType = req.session.userType;

        // For patients: derive patientId from session
        if (userType === 'patient' || userType === 'student') {
            let patientId = await getPatientIdFromUserId(req.session.userId!);

            // Auto-create patient record if needed
            if (!patientId) {
                const user = await storage.getUser(req.session.userId!);
                if (user) {
                    const newPatient = await storage.createPatient({
                        assignedToUserId: user.id,
                        fullName: user.fullName,
                        phone: user.phone || null,
                        clinicId: null,
                    });
                    patientId = newPatient.id;
                }
            }

            if (!patientId) {
                return res.status(400).json({ message: 'لم يتم العثور على سجل المريض الخاص بك' });
            }
            appointmentData.patientId = patientId;
        }

        // For doctors: derive doctorId if not provided
        if (userType === 'doctor' || userType === 'graduate') {
            if (!appointmentData.doctorId) {
                const doctorId = await getDoctorIdFromUserId(req.session.userId!);
                if (doctorId) {
                    appointmentData.doctorId = doctorId;
                }
            }
        }

        // Check for conflicts BEFORE creating
        if (appointmentData.doctorId && appointmentData.date && appointmentData.time) {
            const hasConflict = await storage.checkAppointmentConflict(
                appointmentData.doctorId,
                appointmentData.date,
                appointmentData.time,
                appointmentData.patientId
            );
            if (hasConflict) {
                return res.status(409).json({
                    message: 'الموعد محجوز بالفعل. يرجى اختيار وقت آخر',
                    messageEn: 'This time slot is already booked. Please choose another time.'
                });
            }
        }

        // Validate doctorId
        if (appointmentData.doctorId) {
            const doctor = await storage.getDoctor(appointmentData.doctorId);
            if (!doctor) {
                return res.status(400).json({ message: 'الطبيب المحدد غير موجود' });
            }
        }

        // Validate patientId
        if (appointmentData.patientId) {
            const patient = await storage.getPatient(appointmentData.patientId);
            if (!patient) {
                return res.status(400).json({ message: 'المريض المحدد غير موجود' });
            }
        }

        const appointment = await storage.createAppointment(appointmentData);

        // Log appointment creation
        await logAudit({
            userId: req.session.userId!,
            action: 'CREATE_APPOINTMENT',
            entityType: 'Appointment',
            entityId: appointment.id,
            newData: appointment,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.status(201).json(appointment);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Update appointment
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const existingAppointment = await storage.getAppointment(req.params.id);
        if (!existingAppointment) {
            return res.status(404).json({ message: 'الموعد غير موجود' });
        }

        const userType = req.session.userType;
        if (userType === 'patient' || userType === 'student') {
            const patientId = await getPatientIdFromUserId(req.session.userId!);
            if (existingAppointment.patientId !== patientId) {
                return res.status(403).json({ message: 'غير مصرح لك بتعديل هذا الموعد' });
            }
        }
        if (['doctor', 'graduate'].includes(userType || '')) {
            const doctorId = await getDoctorIdFromUserId(req.session.userId!);
            if (existingAppointment.doctorId !== doctorId) {
                return res.status(403).json({ message: 'غير مصرح لك بتعديل هذا الموعد' });
            }
        }
        // Check for conflicts BEFORE updating
        const updateData = req.body;
        if ((updateData.date || updateData.time || updateData.doctorId) &&
            (updateData.status === 'scheduled' || (!updateData.status && existingAppointment.status === 'scheduled'))) {

            const hasConflict = await storage.checkAppointmentConflict(
                updateData.doctorId || existingAppointment.doctorId,
                updateData.date || existingAppointment.date,
                updateData.time || existingAppointment.time,
                existingAppointment.patientId,
                req.params.id
            );

            if (hasConflict) {
                return res.status(409).json({
                    message: 'الموعد محجوز بالفعل. يرجى اختيار وقت آخر',
                    messageEn: 'This time slot is already booked. Please choose another time.'
                });
            }
        }

        const appointment = await storage.updateAppointment(req.params.id, req.body);

        // Log appointment update
        await logAudit({
            userId: req.session.userId!,
            action: 'UPDATE_APPOINTMENT',
            entityType: 'Appointment',
            entityId: appointment.id,
            previousData: existingAppointment,
            newData: appointment,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.json(appointment);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Mark appointment as attended
router.post('/:id/mark-attended', requireRole('doctor', 'graduate', 'student'), async (req, res) => {
    try {
        const appointment = await storage.getAppointment(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'الموعد غير موجود' });
        }

        const myDoctorId = await getDoctorIdFromUserId(req.session.userId!);
        if (appointment.doctorId !== myDoctorId) {
            return res.status(403).json({ message: 'غير مصرح لك بتأكيد حضور هذا الموعد' });
        }

        if (appointment.status === 'completed') {
            return res.status(400).json({ message: 'تم تأكيد حضور هذا الموعد مسبقاً' });
        }

        const clinicId = req.body.clinicId;
        if (!clinicId) {
            return res.status(400).json({ message: 'يرجى تحديد العيادة' });
        }

        const clinic = await storage.getClinic(clinicId);
        if (!clinic) {
            return res.status(400).json({ message: 'العيادة المحددة غير موجودة' });
        }

        const clinicPrice = await storage.getClinicPrice(clinicId);
        const sessionPrice = clinicPrice?.sessionPrice || "500";

        const session = await storage.createVisitSession({
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            clinicId: clinicId,
            sessionDate: appointment.date,
            attendanceStatus: 'attended',
            price: sessionPrice,
            notes: req.body.notes || null,
        });

        await storage.updateAppointment(req.params.id, { status: 'completed' });

        // Log attendance mark
        await logAudit({
            userId: req.session.userId!,
            action: 'MARK_ATTENDED',
            entityType: 'Appointment',
            entityId: appointment.id,
            newData: { status: 'completed', sessionId: session.id },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
        });

        res.json({ appointment, session });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
