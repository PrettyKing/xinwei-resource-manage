// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // 只在创建时使用，返回时应该被排除
  role: 'admin' | 'manager' | 'operator';
  status: 'active' | 'inactive';
  realName?: string;
  phone?: string;
  isActive?: boolean; // 兼容AuthContext中的isActive字段
  lastLogin?: Date;
  lastLoginAt?: Date; // 兼容AuthContext中的lastLogin字段
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// 供应商类型
export interface Supplier {
  _id: string;
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

// 材料分类
export interface MaterialCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string;
  children?: MaterialCategory[];
}

// 材料类型
export interface Material {
  _id: string;
  name: string;
  code: string;
  categoryId: string;
  category?: MaterialCategory;
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

// 入库单状态
export type InboundStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';

// 入库单类型
export interface InboundOrder {
  remark: any;
  id: string;
  orderNo: string;
  supplierId: string;
  supplier?: Supplier;
  title: string;
  description?: string;
  status: InboundStatus;
  totalAmount: number;
  items: InboundItem[];
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

// 入库单明细
export interface InboundItem {
  remark: string;
  id: string;
  inboundOrderId: string;
  materialId: string;
  material?: Material;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
  batchNo?: string;
  expiryDate?: Date;
  actualQuantity?: number; // 实际入库数量
  status: 'pending' | 'partial' | 'completed';
}

// 库存记录
export interface StockRecord {
  id: string;
  materialId: string;
  material?: Material;
  type: 'inbound' | 'outbound' | 'adjustment';
  quantity: number;
  beforeStock: number;
  afterStock: number;
  referenceId?: string; // 关联的入库单或出库单ID
  referenceType?: 'inbound' | 'outbound' | 'adjustment';
  description?: string;
  operatedBy: string;
  operatedAt: Date;
}

// 库存批次
export interface StockBatch {
  id: string;
  materialId: string;
  material?: Material;
  batchNo: string;
  quantity: number;
  unitPrice: number;
  supplierId: string;
  supplier?: Supplier;
  inboundOrderId: string;
  manufactureDate?: Date;
  expiryDate?: Date;
  status: 'available' | 'reserved' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

// 审批流程
export interface ApprovalFlow {
  id: string;
  targetId: string; // 目标对象ID（如入库单ID）
  targetType: 'inbound' | 'outbound' | 'adjustment';
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected';
  steps: ApprovalStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStep {
  id: string;
  flowId: string;
  stepOrder: number;
  approverRole: 'manager' | 'admin';
  approverUserId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment?: string;
  approvedAt?: Date;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 查询过滤器
export interface MaterialFilter {
  categoryId?: string;
  status?: 'active' | 'inactive';
  keyword?: string;
  lowStock?: boolean;
}

export interface InboundFilter {
  status?: InboundStatus;
  supplierId?: string;
  dateRange?: [Date, Date];
  keyword?: string;
  submittedBy?: string;
}

export interface SupplierFilter {
  status?: 'active' | 'inactive';
  keyword?: string;
}

export interface UserFilter {
  role?: 'admin' | 'manager' | 'operator';
  status?: 'active' | 'inactive';
  keyword?: string;
}

// 统计数据类型
export interface DashboardStats {
  totalMaterials: number;
  totalSuppliers: number;
  pendingInbounds: number;
  lowStockMaterials: number;
  totalValue: number;
  monthlyInboundCount: number;
  monthlyInboundValue: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'inbound_created' | 'inbound_approved' | 'inbound_completed' | 'material_added' | 'supplier_added';
  title: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

// 报表数据类型
export interface MaterialStockReport {
  materialId: string;
  materialName: string;
  materialCode: string;
  categoryName: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  stockValue: number;
  lastInboundDate?: Date;
  status: 'normal' | 'low_stock' | 'overstock';
}

export interface InboundReport {
  orderId: string;
  orderNo: string;
  supplierName: string;
  totalAmount: number;
  status: InboundStatus;
  itemCount: number;
  submittedAt: Date;
  completedAt?: Date;
}

// 表单数据类型
export interface CreateMaterialForm {
  name: string;
  code: string;
  categoryId: string;
  specification: string;
  unit: string;
  description?: string;
  minStock: number;
  maxStock: number;
  price: number;
}

export interface CreateSupplierForm {
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  description?: string;
}

export interface CreateInboundForm {
  supplierId: string;
  title: string;
  description?: string;
  items: CreateInboundItemForm[];
}

export interface CreateInboundItemForm {
  materialId: string;
  quantity: number;
  unitPrice: number;
  description?: string;
  batchNo?: string;
  expiryDate?: Date;
}

export interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'operator';
  realName?: string;
  phone?: string;
}

export interface UpdateUserForm {
  email?: string;
  password?: string;
  role?: 'admin' | 'manager' | 'operator';
  status?: 'active' | 'inactive';
  realName?: string;
  phone?: string;
}

// 系统配置类型
export interface SystemConfig {
  autoApprovalLimit: number; // 自动审批金额限制
  requireBatchNo: boolean; // 是否必须填写批次号
  allowNegativeStock: boolean; // 是否允许负库存
  defaultCurrency: string; // 默认货币
  stockWarningDays: number; // 库存预警天数
}
