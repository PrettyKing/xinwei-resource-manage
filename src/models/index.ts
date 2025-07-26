import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// 用户模型
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'operator';
  status: 'active' | 'inactive';
  realName?: string;
  phone?: string;
  lastLoginAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: { type: String, required: true, minlength: 6 },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'operator'], 
    required: true,
    default: 'operator'
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  realName: { type: String, trim: true },
  phone: { 
    type: String, 
    trim: true,
    match: /^1[3-9]\d{9}$/
  },
  lastLoginAt: { type: Date },
  createdBy: { type: String },
  updatedBy: { type: String },
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password; // 不返回密码字段
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// 创建索引
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 密码比较方法
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// 供应商模型
export interface ISupplier extends Document {
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, required: true, trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  description: { type: String, trim: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 创建索引
SupplierSchema.index({ code: 1 });
SupplierSchema.index({ name: 'text', contactPerson: 'text' });
SupplierSchema.index({ status: 1 });

export const Supplier = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);

// 材料分类模型
export interface IMaterialCategory extends Document {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string; // 路径，如 "1,2,3"
  createdAt: Date;
  updatedAt: Date;
}

const MaterialCategorySchema = new Schema<IMaterialCategory>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  parentId: { type: String },
  level: { type: Number, required: true, default: 1 },
  path: { type: String, required: true }, // 存储完整路径
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

MaterialCategorySchema.index({ code: 1 });
MaterialCategorySchema.index({ parentId: 1 });
MaterialCategorySchema.index({ level: 1 });

export const MaterialCategory = mongoose.models.MaterialCategory || 
  mongoose.model<IMaterialCategory>('MaterialCategory', MaterialCategorySchema);

// 材料模型
export interface IMaterial extends Document {
  name: string;
  code: string;
  categoryId: string;
  specification: string;
  unit: string;
  description?: string;
  minStock: number;
  maxStock: number;
  currentStock: number;
  price: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  categoryId: { type: String, required: true },
  specification: { type: String, required: true, trim: true },
  unit: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  minStock: { type: Number, required: true, min: 0, default: 0 },
  maxStock: { type: Number, required: true, min: 0 },
  currentStock: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段
MaterialSchema.virtual('category', {
  ref: 'MaterialCategory',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

// 创建索引
MaterialSchema.index({ code: 1 });
MaterialSchema.index({ categoryId: 1 });
MaterialSchema.index({ name: 'text', specification: 'text' });
MaterialSchema.index({ status: 1 });
MaterialSchema.index({ currentStock: 1, minStock: 1 }); // 用于库存预警

// 验证 maxStock >= minStock
MaterialSchema.pre('save', function(next) {
  if (this.maxStock < this.minStock) {
    next(new Error('最大库存不能小于最小库存'));
  } else {
    next();
  }
});

export const Material = mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);

// 入库单明细模型
export interface IInboundItem extends Document {
  inboundOrderId: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
  batchNo?: string;
  expiryDate?: Date;
  actualQuantity?: number;
  status: 'pending' | 'partial' | 'completed';
}

const InboundItemSchema = new Schema<IInboundItem>({
  inboundOrderId: { type: String, required: true },
  materialId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0.01 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
  batchNo: { type: String, trim: true },
  expiryDate: { type: Date },
  actualQuantity: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['pending', 'partial', 'completed'], default: 'pending' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

InboundItemSchema.virtual('material', {
  ref: 'Material',
  localField: 'materialId',
  foreignField: '_id',
  justOne: true
});

InboundItemSchema.index({ inboundOrderId: 1 });
InboundItemSchema.index({ materialId: 1 });

export const InboundItem = mongoose.models.InboundItem || 
  mongoose.model<IInboundItem>('InboundItem', InboundItemSchema);

// 入库单模型
export interface IInboundOrder extends Document {
  orderNo: string;
  supplierId: string;
  title: string;
  description?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  totalAmount: number;
  submittedBy: string;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  completedBy?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InboundOrderSchema = new Schema<IInboundOrder>({
  orderNo: { type: String, required: true, unique: true, trim: true },
  supplierId: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'approved', 'rejected', 'completed'], 
    default: 'draft' 
  },
  totalAmount: { type: Number, required: true, min: 0, default: 0 },
  submittedBy: { type: String, required: true },
  submittedAt: { type: Date },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  rejectedReason: { type: String, trim: true },
  completedBy: { type: String },
  completedAt: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段
InboundOrderSchema.virtual('supplier', {
  ref: 'Supplier',
  localField: 'supplierId',
  foreignField: '_id',
  justOne: true
});

InboundOrderSchema.virtual('items', {
  ref: 'InboundItem',
  localField: '_id',
  foreignField: 'inboundOrderId'
});

// 创建索引
InboundOrderSchema.index({ orderNo: 1 });
InboundOrderSchema.index({ supplierId: 1 });
InboundOrderSchema.index({ status: 1 });
InboundOrderSchema.index({ submittedBy: 1 });
InboundOrderSchema.index({ submittedAt: -1 });

// 自动生成订单号
InboundOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNo) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('InboundOrder').countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    });
    this.orderNo = `IN${dateStr}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export const InboundOrder = mongoose.models.InboundOrder || 
  mongoose.model<IInboundOrder>('InboundOrder', InboundOrderSchema);

// 库存记录模型
export interface IStockRecord extends Document {
  materialId: string;
  type: 'inbound' | 'outbound' | 'adjustment';
  quantity: number;
  beforeStock: number;
  afterStock: number;
  referenceId?: string;
  referenceType?: 'inbound' | 'outbound' | 'adjustment';
  description?: string;
  operatedBy: string;
  operatedAt: Date;
}

const StockRecordSchema = new Schema<IStockRecord>({
  materialId: { type: String, required: true },
  type: { type: String, enum: ['inbound', 'outbound', 'adjustment'], required: true },
  quantity: { type: Number, required: true },
  beforeStock: { type: Number, required: true },
  afterStock: { type: Number, required: true },
  referenceId: { type: String },
  referenceType: { type: String, enum: ['inbound', 'outbound', 'adjustment'] },
  description: { type: String, trim: true },
  operatedBy: { type: String, required: true },
  operatedAt: { type: Date, required: true, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

StockRecordSchema.virtual('material', {
  ref: 'Material',
  localField: 'materialId',
  foreignField: '_id',
  justOne: true
});

StockRecordSchema.index({ materialId: 1, operatedAt: -1 });
StockRecordSchema.index({ type: 1 });
StockRecordSchema.index({ operatedAt: -1 });

export const StockRecord = mongoose.models.StockRecord || 
  mongoose.model<IStockRecord>('StockRecord', StockRecordSchema);

// 库存批次模型
export interface IStockBatch extends Document {
  materialId: string;
  batchNo: string;
  quantity: number;
  unitPrice: number;
  supplierId: string;
  inboundOrderId: string;
  manufactureDate?: Date;
  expiryDate?: Date;
  status: 'available' | 'reserved' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const StockBatchSchema = new Schema<IStockBatch>({
  materialId: { type: String, required: true },
  batchNo: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  supplierId: { type: String, required: true },
  inboundOrderId: { type: String, required: true },
  manufactureDate: { type: Date },
  expiryDate: { type: Date },
  status: { type: String, enum: ['available', 'reserved', 'expired'], default: 'available' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

StockBatchSchema.virtual('material', {
  ref: 'Material',
  localField: 'materialId',
  foreignField: '_id',
  justOne: true
});

StockBatchSchema.virtual('supplier', {
  ref: 'Supplier',
  localField: 'supplierId',
  foreignField: '_id',
  justOne: true
});

StockBatchSchema.index({ materialId: 1, batchNo: 1 }, { unique: true });
StockBatchSchema.index({ expiryDate: 1 });
StockBatchSchema.index({ status: 1 });

export const StockBatch = mongoose.models.StockBatch || 
  mongoose.model<IStockBatch>('StockBatch', StockBatchSchema);
