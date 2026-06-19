import mongoose, { Document, Schema } from 'mongoose';

export enum InterviewStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface IInterviewSession extends Document {
  id: string;
  user: mongoose.Types.ObjectId;
  positionRole?: string;
  experienceLevel?: string;
  interviewType?: string;
  language?: string;
  status: InterviewStatus;
  currentTurn?: number;
  targetTurns?: number;
  startedAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;
  overallAiSummary?: string;
  overallScore?: number;
  techStack?: string;
  jobDescription?: string;
  resumeText?: string;
  isHardcore: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const interviewSessionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    positionRole: { type: String },
    experienceLevel: { type: String },
    interviewType: { type: String },
    language: { type: String },
    status: { type: String, enum: Object.values(InterviewStatus), default: InterviewStatus.PENDING },
    currentTurn: { type: Number, default: 0 },
    targetTurns: { type: Number, default: 5 },
    startedAt: { type: Date },
    endedAt: { type: Date },
    durationSeconds: { type: Number },
    overallAiSummary: { type: String },
    overallScore: { type: Number },
    techStack: { type: String },
    jobDescription: { type: String },
    resumeText: { type: String },
    isHardcore: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const InterviewSession = mongoose.model<IInterviewSession>('InterviewSession', interviewSessionSchema);
