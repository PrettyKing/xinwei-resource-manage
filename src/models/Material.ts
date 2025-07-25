import mongoose, { Schema, Document } from 'mongoose';

// 材料接口
export interface IMaterial extends Document {
  name: string;
  code: string;
  category: string;
  specification: string;
  unit: string;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 材料模型
const MaterialSchema = new Schema<IMaterial>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  specification: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 创建索引
MaterialSchema.index({ code: 1, name: 1, category: 1 });

export const Material = mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);
