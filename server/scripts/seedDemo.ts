import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
}

// Define schemas (simplified versions)
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    fullName: String,
    email: String,
    phone: String,
    userType: String,
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const patientSchema = new mongoose.Schema({
    fullName: String,
    age: Number,
    gender: String,
    phone: String,
    email: String,
    address: String,
    medicalHistory: String,
    clinicId: String,
    assignedToUserId: String,
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const doctorSchema = new mongoose.Schema({
    fullName: String,
    specialization: String,
    phone: String,
    email: String,
    clinicId: String,
    userId: String,
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
    patientId: String,
    doctorId: String,
    clinicId: String,
    date: String,
    time: String,
    status: { type: String, default: 'scheduled' },
    notes: String,
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const clinicSchema = new mongoose.Schema({
    name: String,
    nameAr: String,
    description: String,
    color: String,
    icon: String,
    deletedAt: { type: Date, default: null }
});

const UserModel = mongoose.model('User', userSchema);
const PatientModel = mongoose.model('Patient', patientSchema);
const DoctorModel = mongoose.model('Doctor', doctorSchema);
const AppointmentModel = mongoose.model('Appointment', appointmentSchema);
const ClinicModel = mongoose.model('Clinic', clinicSchema);

async function seedDemo() {
    console.log('🌱 Starting demo data seeding process...\\n');

    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('✅ Connected to MongoDB\\n');

        // Check if demo user already exists
        const existingUser = await UserModel.findOne({ username: 'patient1' });
        if (existingUser) {
            console.log('⚠️  Demo data already exists. Skipping...\\n');
            await mongoose.connection.close();
            return;
        }

        // Get clinics for assigning
        const clinics = await ClinicModel.find({ deletedAt: null });
        if (clinics.length === 0) {
            console.error('❌ No clinics found! Please run seedClinics.ts first.');
            process.exit(1);
        }

        console.log(`📊 Found ${clinics.length} clinics\\n`);

        // Create demo patient user
        console.log('👤 Creating demo patient user...');
        const hashedPassword = await bcrypt.hash('demo123', 10);
        const patientUser = await UserModel.create({
            username: 'patient1',
            password: hashedPassword,
            fullName: 'أحمد محمد علي',
            email: 'ahmed@example.com',
            phone: '+20 100 111 2222',
            userType: 'patient'
        });
        console.log(`✅ Created patient user: ${patientUser.fullName} (username: patient1, password: demo123)\\n`);

        // Create patient record
        console.log('📋 Creating patient record...');
        const patient = await PatientModel.create({
            fullName: patientUser.fullName,
            age: 28,
            gender: 'male',
            phone: patientUser.phone,
            email: patientUser.email,
            address: 'المنصورة، الدقهلية، مصر',
            medicalHistory: 'لا يوجد أمراض مزمنة',
            clinicId: clinics[0]._id.toString(),
            assignedToUserId: patientUser._id.toString()
        });
        console.log(`✅ Created patient record for ${patient.fullName}\\n`);

        // Create demo doctors
        console.log('👨‍⚕️ Creating demo doctors...');
        const doctors = [];

        const doctorsData = [
            {
                fullName: 'د. محمد أحمد حسن',
                specialization: 'التركيبات الثابتة',
                phone: '+20 100 222 3333',
                email: 'dr.mohamed@hospital.com',
                clinicId: clinics[4]?._id.toString() || clinics[0]._id.toString(),
                rating: 4.8,
                reviewCount: 45
            },
            {
                fullName: 'د. سارة عبد الرحمن',
                specialization: 'تقويم الأسنان',
                phone: '+20 100 333 4444',
                email: 'dr.sara@hospital.com',
                clinicId: clinics[9]?._id.toString() || clinics[1]._id.toString(),
                rating: 4.9,
                reviewCount: 62
            },
            {
                fullName: 'د. خالد سمير',
                specialization: 'جراحة الفم والفكين',
                phone: '+20 100 444 5555',
                email: 'dr.khaled@hospital.com',
                clinicId: clinics[2]?._id.toString() || clinics[0]._id.toString(),
                rating: 4.7,
                reviewCount: 38
            },
            {
                fullName: 'د. فاطمة علي',
                specialization: 'أسنان الأطفال',
                phone: '+20 100 555 6666',
                email: 'dr.fatma@hospital.com',
                clinicId: clinics[10]?._id.toString() || clinics[1]._id.toString(),
                rating: 4.9,
                reviewCount: 71
            }
        ];

        for (const doctorData of doctorsData) {
            const doctor = await DoctorModel.create(doctorData);
            doctors.push(doctor);
            console.log(`   ✅ Created doctor: ${doctor.fullName}`);
        }
        console.log(`\\n✅ Created ${doctors.length} doctors\\n`);

        // Create sample appointments
        console.log('📅 Creating sample appointments...');
        const appointments = [];

        // Get today's date and future dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const formatDate = (date: Date) => {
            return date.toISOString().split('T')[0];
        };

        const appointmentsData = [
            {
                patientId: patient._id.toString(),
                doctorId: doctors[0]._id.toString(),
                clinicId: doctors[0].clinicId,
                date: formatDate(tomorrow),
                time: '10:00 AM',
                status: 'scheduled',
                notes: 'فحص روتيني - تركيبات'
            },
            {
                patientId: patient._id.toString(),
                doctorId: doctors[1]._id.toString(),
                clinicId: doctors[1].clinicId,
                date: formatDate(nextWeek),
                time: '02:00 PM',
                status: 'scheduled',
                notes: 'متابعة تقويم'
            },
            {
                patientId: patient._id.toString(),
                doctorId: doctors[2]._id.toString(),
                clinicId: doctors[2].clinicId,
                date: '2025-02-15',
                time: '11:00 AM',
                status: 'scheduled',
                notes: 'خلع ضرس العقل'
            }
        ];

        for (const aptData of appointmentsData) {
            const appointment = await AppointmentModel.create(aptData);
            appointments.push(appointment);
            console.log(`   ✅ Created appointment: ${aptData.date} at ${aptData.time}`);
        }
        console.log(`\\n✅ Created ${appointments.length} appointments\\n`);

        // Summary
        console.log('\\n=========================================');
        console.log('✨ Demo data seeding completed successfully!');
        console.log('=========================================');
        console.log('\\n📝 Login Credentials:');
        console.log('   Username: patient1');
        console.log('   Password: demo123');
        console.log('\\n📊 Summary:');
        console.log(`   ✅ 1 Patient User`);
        console.log(`   ✅ 1 Patient Record`);
        console.log(`   ✅ ${doctors.length} Doctors`);
        console.log(`   ✅ ${appointments.length} Appointments`);
        console.log('\\n🎉 You can now login with the credentials above!\\n');

    } catch (error: any) {
        console.error('\\n❌ Error during seeding:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed.\\n');
    }
}

// Run the seed function
seedDemo();
