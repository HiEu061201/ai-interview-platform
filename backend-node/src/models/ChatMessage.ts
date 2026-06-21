import mongoose, { Document, Schema } from 'mongoose';

export enum Sender {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM'
}

export interface IChatMessage extends Document {
  session: mongoose.Types.ObjectId;
  sender: Sender;
  messageType?: string;
  turnNo?: number;
  messageContent: string;
  modelName?: string;
  promptTokens?: number;
  completionTokens?: number;
  responseTimeMs?: number;
  suggestedAnswer?: string;
  scoreClarity?: number;
  scoreTechnical?: number;
  scoreConfidence?: number;
  scoreSituation?: number;
  scoreTask?: number;
  scoreAction?: number;
  scoreResult?: number;
  categoryTopic?: string;
  createdAt: Date;
}

const chatMessageSchema: Schema = new Schema(
  {
    session: { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
    sender: { type: String, enum: Object.values(Sender), required: true },
    messageType: { type: String },
    turnNo: { type: Number },
    messageContent: { type: String, required: true },
    modelName: { type: String },
    promptTokens: { type: Number },
    completionTokens: { type: Number },
    responseTimeMs: { type: Number },
    suggestedAnswer: { type: String },
    scoreClarity: { type: Number },
    scoreTechnical: { type: Number },
    scoreConfidence: { type: Number },
    scoreSituation: { type: Number },
    scoreTask: { type: Number },
    scoreAction: { type: Number },
    scoreResult: { type: Number },
    categoryTopic: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt for messages
  }
);

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
