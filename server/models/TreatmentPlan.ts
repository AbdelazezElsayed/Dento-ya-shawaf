import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatmentPlan extends Document {
  patientId: mongoose.Types.ObjectId;
  clinicId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
}

const TreatmentPlanSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITreatmentPlan>('TreatmentPlan', TreatmentPlanSchema);
