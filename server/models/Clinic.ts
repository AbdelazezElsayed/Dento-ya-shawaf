import mongoose, { Schema, Document } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  nameEn?: string;
  specializationTag?: string;
  address?: string;
  contact?: string;
  email?: string;
}

const ClinicSchema: Schema = new Schema({
  name: { type: String, required: true },
  nameEn: { type: String },
  specializationTag: { type: String },
  address: { type: String },
  contact: { type: String },
  email: { type: String },
});

export default mongoose.model<IClinic>('Clinic', ClinicSchema);
