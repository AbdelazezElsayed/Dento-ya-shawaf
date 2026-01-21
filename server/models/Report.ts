import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  patientId: mongoose.Types.ObjectId;
  clinicId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  reportType: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ReportSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  reportType: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IReport>('Report', ReportSchema);
