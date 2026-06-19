import mongoose, { Document, Schema } from 'mongoose';

export enum QuestType {
  COMPLETE_ANY = 'COMPLETE_ANY',
  COMPLETE_HARDCORE = 'COMPLETE_HARDCORE',
  ACHIEVE_HIGH_SCORE = 'ACHIEVE_HIGH_SCORE',
}

export interface IUserQuest extends Document {
  user: mongoose.Types.ObjectId;
  questType: QuestType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  rewardExp: number;
  isCompleted: boolean;
  assignedDate: string; // ISO date string YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

const userQuestSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questType: { type: String, enum: Object.values(QuestType), required: true },
    title: { type: String, required: true },
    description: { type: String },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    rewardExp: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },
    assignedDate: { type: String, required: true }, // 'YYYY-MM-DD'
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const UserQuest = mongoose.model<IUserQuest>('UserQuest', userQuestSchema);
