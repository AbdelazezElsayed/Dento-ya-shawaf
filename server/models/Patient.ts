import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  fullName: string;
  age: number;
  phone: string;
  clinicId: mongoose.Types.ObjectId;
  assignedToUserId?: mongoose.Types.ObjectId;
  status: string;
  createdAt: Date;
}

const PatientSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  assignedToUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPatient>('Patient', PatientSchema);
