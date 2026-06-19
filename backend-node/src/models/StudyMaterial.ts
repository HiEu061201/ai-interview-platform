import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
}

const studyCategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  displayOrder: { type: Number, default: 0 },
});

export const StudyCategory = mongoose.model<IStudyCategory>('StudyCategory', studyCategorySchema);

export interface IStudyMaterial extends Document {
  category: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  displayOrder: number;
  createdAt: Date;
}

const studyMaterialSchema: Schema = new Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: 'StudyCategory', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const StudyMaterial = mongoose.model<IStudyMaterial>('StudyMaterial', studyMaterialSchema);
