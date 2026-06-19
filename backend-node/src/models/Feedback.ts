import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewFeedback extends Document {
  session: mongoose.Types.ObjectId;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  clarityScore: number;
  confidenceScore: number;
  strengths?: string;
  weaknesses?: string;
  detailedReview?: string;
  improvementPlan?: string;
  recommendationLevel?: string;
  createdAt: Date;
}

const interviewFeedbackSchema: Schema = new Schema(
  {
    session: { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true, unique: true },
    overallScore: { type: Number, default: 0 },
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    clarityScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    strengths: { type: String },
    weaknesses: { type: String },
    detailedReview: { type: String },
    improvementPlan: { type: String },
    recommendationLevel: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const InterviewFeedback = mongoose.model<IInterviewFeedback>('InterviewFeedback', interviewFeedbackSchema);
