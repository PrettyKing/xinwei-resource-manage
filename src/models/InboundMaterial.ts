import mongoose, { Schema, Document } from 'mongoose';

// 整合的入库材料接口
export interface IInboundMaterial extends Document {
  // 入库基本信息
  orderNumber: string;            // 入库单号
  materialName: string;           // 材料名称
  manufacturer: string;           // 材料厂商
  
  // 材料规格信息
  specification: string;          // 规格
  color: string;                  // 颜色
  pantoneColor?: string;          // 潘通色号
  
  // 使用信息
  usedComponent?: string;         // 使用部件
  customer?: string;              // 使用客户
  season?: string;                // 样品季节
  
  // 库存和价格信息
  currentStock: number;           // 库存
  unitPrice: number;              // 单价
  totalValue: number;             // 总价值
  unit: string;                   // 单位
  
  // 描述和备注
  description?: string;           // 描述
  remarks?: string;               // 备注
  
  // 供应商信息
  supplierId?: mongoose.Types.ObjectId;
  supplierName?: string;
  
  // 状态和审批
  status: 'active' | 'inactive' | 'pending' | 'approved';
  
  // 批次信息
  batchNumber?: string;           // 批次号
  manufactureDate?: Date;         // 生产日期
  expiryDate?: Date;              // 过期日期
  
  // 操作信息
  operator: {
    id: mongoose.Types.ObjectId;
    name: string;
  };
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}

// 入库材料模型
const InboundMaterialSchema = new Schema<IInboundMaterial>({
  // 入库基本信息
  orderNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  materialName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  // 材料规格信息
  specification: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  pantoneColor: {
    type: String,
    trim: true,
    index: true
  },
  
  // 使用信息
  usedComponent: {
    type: String,
    trim: true,
    index: true
  },
  customer: {
    type: String,
    trim: true,
    index: true
  },
  season: {
    type: String,
    trim: true,
    enum: ['春季', '夏季', '秋季', '冬季', '全年', ''],
    index: true
  },
  
  // 库存和价格信息
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0,
    default: 0 // 添加默认值
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    default: '件'
  },
  
  // 描述和备注
  description: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  
  // 供应商信息 - 修改为可选字段
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false // 显式设为非必需
  },
  supplierName: {
    type: String,
    trim: true
  },
  
  // 状态
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'approved'],
    default: 'pending',
    index: true
  },
  
  // 批次信息
  batchNumber: {
    type: String,
    trim: true,
    index: true
  },
  manufactureDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  
  // 操作信息 - 添加默认值处理
  operator: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      default: () => new mongoose.Types.ObjectId() // 默认生成一个ObjectId
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'System User' // 默认操作员名称
    }
  }
}, {
  timestamps: true
});

// 创建复合索引
InboundMaterialSchema.index({ 
  orderNumber: 1, 
  materialName: 1, 
  manufacturer: 1 
});

InboundMaterialSchema.index({ 
  color: 1, 
  pantoneColor: 1, 
  customer: 1 
});

InboundMaterialSchema.index({ 
  status: 1, 
  createdAt: -1 
});

// 计算总价值的中间件
InboundMaterialSchema.pre('save', function(next) {
  // 如果 currentStock 或 unitPrice 被修改，或者 totalValue 未设置，则计算 totalValue
  if (this.isModified('currentStock') || this.isModified('unitPrice') || !this.totalValue) {
    this.totalValue = this.currentStock * this.unitPrice;
  }
  next();
});

// 验证 supplierId 的中间件
InboundMaterialSchema.pre('save', function(next) {
  // 如果 supplierId 是空字符串，将其设为 undefined
  if (this.supplierId === '') {
    this.supplierId = undefined;
  }
  next();
});

export const InboundMaterial = mongoose.models.InboundMaterial || 
  mongoose.model<IInboundMaterial>('InboundMaterial', InboundMaterialSchema);