import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  contact?: string;
  email?: string;
  clinicId?: mongoose.Types.ObjectId;
}

const DoctorSchema: Schema = new Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  contact: { type: String },
  email: { type: String },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic' },
});

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);
