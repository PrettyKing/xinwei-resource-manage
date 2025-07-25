import mongoose, { Schema, Document } from 'mongoose';

// 用户接口
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'operator';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 用户模型
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'operator'],
    default: 'operator'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// 创建索引
UserSchema.index({ email: 1, username: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
