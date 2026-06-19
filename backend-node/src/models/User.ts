import mongoose, { Document, Schema } from 'mongoose';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED'
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE'
}

export interface IUser extends Document {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  fullName?: string;
  role: Role;
  status: UserStatus;
  lastLoginAt?: Date;
  authProvider: AuthProvider;
  providerId?: string;
  level: number;
  exp: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    fullName: { type: String },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    lastLoginAt: { type: Date },
    authProvider: { type: String, enum: Object.values(AuthProvider), default: AuthProvider.LOCAL },
    providerId: { type: String },
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }, // Automatically manages createdAt and updatedAt
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
