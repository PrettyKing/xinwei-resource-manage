import mongoose, { Schema, Document } from 'mongoose';

// 入库单明细接口
export interface IInboundItem {
  materialId: mongoose.Types.ObjectId;
  materialName: string;
  materialCode: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
  expiryDate?: Date;
  remarks?: string;
}

// 入库单接口
export interface IInboundOrder extends Document {
  orderNumber: string;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  items: IInboundItem[];
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  operator: {
    id: mongoose.Types.ObjectId;
    name: string;
  };
  approver?: {
    id: mongoose.Types.ObjectId;
    name: string;
    approvedAt?: Date;
  };
  deliveryDate?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 入库单明细子模式
const InboundItemSchema = new Schema<IInboundItem>({
  materialId: {
    type: Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  materialName: {
    type: String,
    required: true,
    trim: true
  },
  materialCode: {
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
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  remarks: {
    type: String,
    trim: true
  }
});

// 入库单模型
const InboundOrderSchema = new Schema<IInboundOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
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
  items: [InboundItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },
  operator: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  },
  approver: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true
    },
    approvedAt: {
      type: Date
    }
  },
  deliveryDate: {
    type: Date
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 创建索引
InboundOrderSchema.index({ orderNumber: 1, status: 1, createdAt: -1 });

export const InboundOrder = mongoose.models.InboundOrder || mongoose.model<IInboundOrder>('InboundOrder', InboundOrderSchema);
