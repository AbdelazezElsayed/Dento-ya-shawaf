import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session?.userId) {
        return res.status(401).json({ message: 'غير مسموح - يرجى تسجيل الدخول' });
    }
    next();
}

async function getPatientIdFromUserId(userId: string): Promise<string | null> {
    const patient = await storage.getPatientByUserId(userId);
    return patient?.id || null;
}

async function getDoctorIdFromUserId(userId: string): Promise<string | null> {
    const doctor = await storage.getDoctorByUserId(userId);
    return doctor?.id || null;
}

// Dashboard stats - returns counts based on user role
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId!;
        const userType = req.session.userType;

        // Stats object
        const stats: Record<string, any> = {
            appointmentsCount: 0,
            upcomingAppointments: 0,
            completedAppointments: 0,
            totalPaid: 0,
            balance: 0,
            treatmentProgress: 0,
        };

        if (userType === 'patient' || userType === 'student') {
            const patientId = await getPatientIdFromUserId(userId);

            if (patientId) {
                // Get appointments
                const appointments = await storage.getAppointmentsByPatient(patientId);
                stats.appointmentsCount = appointments.length;
                stats.upcomingAppointments = appointments.filter(a => a.status === 'scheduled').length;
                stats.completedAppointments = appointments.filter(a => a.status === 'completed').length;

                // Get balance
                const balance = await storage.getPatientBalance(patientId);
                stats.totalPaid = balance.totalPaid;
                stats.balance = balance.balance;
                stats.totalDue = balance.totalDue;

                // Treatment progress (simple calculation)
                if (stats.appointmentsCount > 0) {
                    stats.treatmentProgress = Math.round((stats.completedAppointments / stats.appointmentsCount) * 100);
                }
            }
        } else if (userType === 'doctor' || userType === 'graduate') {
            const doctorId = await getDoctorIdFromUserId(userId);

            if (doctorId) {
                // Get appointments
                const appointments = await storage.getAppointmentsByDoctor(doctorId);
                stats.appointmentsCount = appointments.length;
                stats.upcomingAppointments = appointments.filter(a => a.status === 'scheduled').length;
                stats.completedAppointments = appointments.filter(a => a.status === 'completed').length;

                // Today's appointments
                const today = new Date().toISOString().split('T')[0];
                const todayAppointments = await storage.getAppointmentsByDoctorAndDate(doctorId, today);
                stats.todayAppointments = todayAppointments.length;

                // Get all patients (for doctors)
                const patients = await storage.getPatients();
                stats.patientsCount = patients.length;
            }
        } else {
            // Admin or other roles - get all counts
            const [appointments, patients, doctors, clinics] = await Promise.all([
                storage.getAppointments(),
                storage.getPatients(),
                storage.getDoctors(),
                storage.getClinics(),
            ]);

            stats.appointmentsCount = appointments.length;
            stats.patientsCount = patients.length;
            stats.doctorsCount = doctors.length;
            stats.clinicsCount = clinics.length;
            stats.upcomingAppointments = appointments.filter(a => a.status === 'scheduled').length;
            stats.completedAppointments = appointments.filter(a => a.status === 'completed').length;
        }

        res.json(stats);
    } catch (err: any) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get next appointment for patient
router.get('/next-appointment', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId!;
        const userType = req.session.userType;

        let appointments: any[] = [];

        if (userType === 'patient' || userType === 'student') {
            const patientId = await getPatientIdFromUserId(userId);
            if (patientId) {
                appointments = await storage.getAppointmentsByPatient(patientId);
            }
        } else if (userType === 'doctor' || userType === 'graduate') {
            const doctorId = await getDoctorIdFromUserId(userId);
            if (doctorId) {
                appointments = await storage.getAppointmentsByDoctor(doctorId);
            }
        }

        // Filter to upcoming and sort by date
        const upcoming = appointments
            .filter(a => a.status === 'scheduled')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (upcoming.length > 0) {
            const nextAppointment = upcoming[0];

            // Get doctor details
            let doctorName = null;
            if (nextAppointment.doctorId) {
                const doctor = await storage.getDoctor(nextAppointment.doctorId);
                doctorName = doctor?.fullName || doctor?.name;
            }

            // Get clinic details
            let clinicName = null;
            if (nextAppointment.clinicId) {
                const clinic = await storage.getClinic(nextAppointment.clinicId);
                clinicName = clinic?.name || clinic?.nameAr;
            }

            res.json({
                ...nextAppointment,
                doctorName,
                clinicName,
            });
        } else {
            res.json(null);
        }
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
