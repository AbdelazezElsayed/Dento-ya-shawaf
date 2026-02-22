import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  description: string;
  date: string;
  cost?: number;
}

const TreatmentSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  cost: { type: Number },
});

export default mongoose.model<ITreatment>('Treatment', TreatmentSchema);
