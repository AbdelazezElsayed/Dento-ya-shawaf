import mongoose from 'mongoose';
import logger from './utils/logger';

export const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI must be set');
  }

  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected successfully');

    // Initialize GridFS for file storage
    const { initializeGridFS } = await import('./utils/gridfsStorage');
    await initializeGridFS();
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// ============================================
// USER SCHEMA
// ============================================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined emails without uniqueness conflicts
    validate: {
      validator: function (v: string) {
        return !v || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  phone: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined phones without uniqueness conflicts
    validate: {
      validator: function (v: string) {
        return !v || /^01[0-9]{9}$/.test(v); // Egyptian phone format
      },
      message: 'Invalid phone format (must be 11 digits starting with 01)'
    }
  },
  userType: { type: String, required: true, enum: ['patient', 'doctor', 'student', 'graduate', 'admin'] },
  isActive: { type: Boolean, default: true }, // For admin to deactivate users
  deletedAt: { type: Date, default: null }, // Soft delete
  createdAt: { type: Date, default: Date.now }
});

// ============================================
// PATIENT SCHEMA
// ============================================
const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, min: 0, max: 150 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  medicalHistory: { type: String },
  clinicId: { type: String },
  assignedToUserId: { type: String },
  deletedAt: { type: Date, default: null }, // Soft delete
  createdAt: { type: Date, default: Date.now }
});
// Index for faster lookups
patientSchema.index({ assignedToUserId: 1 });
patientSchema.index({ deletedAt: 1 }); // Soft delete filter
patientSchema.index({ fullName: 'text' }); // Text search

// ============================================
// DOCTOR SCHEMA
// ============================================
const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  specialization: { type: String },
  phone: { type: String },
  email: { type: String },
  clinicId: { type: String },
  userId: { type: String },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  isAvailable: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null }, // Soft delete
  createdAt: { type: Date, default: Date.now }
});
// Index for faster lookups
doctorSchema.index({ userId: 1 });
doctorSchema.index({ clinicId: 1 });
doctorSchema.index({ deletedAt: 1 }); // Soft delete filter
doctorSchema.index({ isAvailable: 1 }); // Available doctors query

// ============================================
// CLINIC SCHEMA
// ============================================
const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: { type: String },
  description: { type: String },
  color: { type: String },
  icon: { type: String },
  deletedAt: { type: Date, default: null }, // Soft delete
  createdAt: { type: Date, default: Date.now }
});
clinicSchema.index({ deletedAt: 1 }); // Soft delete filter

// ============================================
// APPOINTMENT SCHEMA
// ============================================
const appointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  clinicId: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: { type: String },
  deletedAt: { type: Date, default: null }, // Soft delete
  createdAt: { type: Date, default: Date.now }
});
// Compound indexes for conflict detection and queries
appointmentSchema.index({ doctorId: 1, date: 1, time: 1, status: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1 }); // Status filter
appointmentSchema.index({ deletedAt: 1 }); // Soft delete filter

// CRITICAL: Prevent double-booking with unique constraint (only for scheduled appointments)
// Using partial filter to exclude cancelled/completed from uniqueness check
appointmentSchema.index(
  { doctorId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'scheduled', deletedAt: null }
  }
);

// ============================================
// TREATMENT SCHEMA
// ============================================
const treatmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  clinicId: { type: String },
  description: { type: String, required: true },
  date: { type: String, required: true },
  cost: { type: Number, min: 0 }, // Changed from String to Number
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// ============================================
// TREATMENT PLAN SCHEMA
// ============================================
const treatmentPlanSchema = new mongoose.Schema({
  patientId: { type: String, required: true, index: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String },
  title: { type: String, required: true },
  description: { type: String },

  // Timeline fields
  planStartDate: { type: Date },
  estimatedDuration: { type: String }, // e.g., "3-6 months"

  // Detailed procedures
  procedures: [{
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed'],
      default: 'scheduled'
    },
    scheduledDate: { type: Date },
    completedDate: { type: Date }
  }],

  // Appointments
  appointments: [{
    type: { type: String }, // e.g., "Follow-up", "Consultation"
    clinic: { type: String },
    date: { type: String },
    time: { type: String }
  }],

  // Doctor's notes
  notes: { type: String },

  // Overall status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient querying
treatmentPlanSchema.index({ patientId: 1, status: 1 });

// ============================================
// REPORT SCHEMA
// ============================================
const reportSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: String },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ============================================
// VISIT SESSION SCHEMA
// ============================================
const visitSessionSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  clinicId: { type: String, required: true },
  sessionDate: { type: String, required: true },
  attendanceStatus: {
    type: String,
    enum: ['pending', 'attended', 'missed'],
    default: 'pending'
  },
  price: { type: Number, default: 500, min: 0 }, // Changed from String to Number
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});
// Index for patient balance calculation
visitSessionSchema.index({ patientId: 1, attendanceStatus: 1 });

// ============================================
// PAYMENT SCHEMA
// ============================================
const paymentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 }, // Changed from String to Number
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer'],
    default: 'cash'
  },
  paymentDate: { type: String, required: true },
  notes: { type: String },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});
// Index for patient payments lookup
paymentSchema.index({ patientId: 1 });

// ============================================
// CLINIC PRICE SCHEMA
// ============================================
const clinicPriceSchema = new mongoose.Schema({
  clinicId: { type: String, required: true, unique: true },
  sessionPrice: { type: Number, default: 500, min: 0 }, // Changed from String to Number
  updatedBy: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

// ============================================
// AUDIT LOG SCHEMA
// ============================================
const auditLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String },
  previousData: { type: mongoose.Schema.Types.Mixed },
  newData: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1 }); // Filter by action type
// TTL index - automatically delete audit logs older than 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// ============================================
// RATING SCHEMA
// ============================================
const ratingSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, index: true },
  patientId: { type: String, required: true, index: true },
  appointmentId: { type: String }, // Optional: link to appointment
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null } // Soft delete
});

// Indexes for efficient queries
ratingSchema.index({ doctorId: 1, deletedAt: 1 }); // Get ratings by doctor
ratingSchema.index({ patientId: 1, deletedAt: 1 }); // Get ratings by patient
ratingSchema.index({ createdAt: -1 }); // Sort by newest

// ============================================
// NOTIFICATION SCHEMA
// ============================================
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  titleEn: { type: String },
  messageEn: { type: String },
  type: {
    type: String,
    enum: ['appointment', 'payment', 'system', 'reminder', 'alert'],
    default: 'system'
  },
  relatedEntityType: { type: String }, // e.g., 'Appointment', 'Payment'
  relatedEntityId: { type: String },   // ID of the related entity
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date } // Optional expiration
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 }); // Get user notifications, sort by newest
notificationSchema.index({ userId: 1, createdAt: -1 }); // Get all user notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// ============================================
// DIAGNOSIS RECORD SCHEMA
// ============================================
const diagnosisRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  patientId: { type: String }, // Optional link to patient record
  answers: { type: mongoose.Schema.Types.Mixed }, // Form answers from diagnosis
  conditions: [{
    name: String,
    nameEn: String,
    conditionKey: String,
    probability: Number,
    description: String
  }],
  recommendations: [String],
  urgency: { type: String, enum: ['low', 'medium', 'high'] },
  confidence: { type: Number, min: 0, max: 100 },
  suggestedClinic: {
    id: String,
    name: String,
    nameAr: String,
    nameEn: String
  },
  xrayFileId: { type: String }, // GridFS file ID
  xrayFilename: { type: String }, // Original filename
  estimatedTreatmentTime: { type: String },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null }
});

// Indexes
diagnosisRecordSchema.index({ userId: 1, createdAt: -1 });
diagnosisRecordSchema.index({ patientId: 1, createdAt: -1 });
diagnosisRecordSchema.index({ deletedAt: 1 });

// ============================================
// EXPORT MODELS
// ============================================
export const UserModel = mongoose.model('User', userSchema);
export const PatientModel = mongoose.model('Patient', patientSchema);
export const DoctorModel = mongoose.model('Doctor', doctorSchema);
export const ClinicModel = mongoose.model('Clinic', clinicSchema);
export const AppointmentModel = mongoose.model('Appointment', appointmentSchema);
export const TreatmentModel = mongoose.model('Treatment', treatmentSchema);
export const TreatmentPlanModel = mongoose.model('TreatmentPlan', treatmentPlanSchema);
export const ReportModel = mongoose.model('Report', reportSchema);
export const VisitSessionModel = mongoose.model('VisitSession', visitSessionSchema);
export const PaymentModel = mongoose.model('Payment', paymentSchema);
export const ClinicPriceModel = mongoose.model('ClinicPrice', clinicPriceSchema);
export const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);
export const RatingModel = mongoose.model('Rating', ratingSchema);
export const NotificationModel = mongoose.model('Notification', notificationSchema);
export const DiagnosisRecordModel = mongoose.model('DiagnosisRecord', diagnosisRecordSchema);
