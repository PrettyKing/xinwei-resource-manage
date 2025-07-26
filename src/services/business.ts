import { 
  Material, 
  MaterialCategory, 
  Supplier, 
  InboundOrder, 
  InboundItem, 
  StockRecord, 
  StockBatch,
  User,
  IMaterial,
  IMaterialCategory,
  ISupplier,
  IInboundOrder,
  IInboundItem,
  IStockRecord,
  IStockBatch,
  IUser
} from '@/models';
import { 
  CreateMaterialForm, 
  CreateSupplierForm, 
  CreateInboundForm,
  CreateUserForm,
  UpdateUserForm,
  MaterialFilter,
  InboundFilter,
  SupplierFilter,
  UserFilter,
  PaginationParams,
  PaginatedResponse,
  DashboardStats,
  RecentActivity
} from '@/types/business';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export class MaterialService {
  static async getAll(filter: MaterialFilter, pagination: PaginationParams): Promise<PaginatedResponse<IMaterial>> {
    await connectDB();
    
    const query: any = {};
    
    if (filter.categoryId) query.categoryId = filter.categoryId;
    if (filter.status) query.status = filter.status;
    if (filter.keyword) {
      query.$or = [
        { name: { $regex: filter.keyword, $options: 'i' } },
        { code: { $regex: filter.keyword, $options: 'i' } },
        { specification: { $regex: filter.keyword, $options: 'i' } }
      ];
    }
    if (filter.lowStock) {
      query.$expr = { $lte: ['$currentStock', '$minStock'] };
    }

    const skip = (pagination.page - 1) * pagination.pageSize;
    const sort: any = {};
    if (pagination.sortBy) {
      sort[pagination.sortBy] = pagination.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.updatedAt = -1;
    }

    const [items, total] = await Promise.all([
      Material.find(query)
        .populate('category')
        .sort(sort)
        .skip(skip)
        .limit(pagination.pageSize)
        .lean(),
      Material.countDocuments(query)
    ]);

    return {
      items,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize)
    };
  }

  static async getById(id: string): Promise<IMaterial | null> {
    await connectDB();
    return Material.findById(id).populate('category').lean();
  }

  static async create(data: CreateMaterialForm, userId: string): Promise<IMaterial> {
    await connectDB();
    
    // 检查编码是否唯一
    const existingCode = await Material.findOne({ code: data.code });
    if (existingCode) {
      throw new Error('材料编码已存在');
    }

    // 验证分类是否存在
    const category = await MaterialCategory.findById(data.categoryId);
    if (!category) {
      throw new Error('材料分类不存在');
    }

    const material = new Material({
      ...data,
      currentStock: 0,
      createdBy: userId
    });

    await material.save();
    return material.populate('category');
  }

  static async update(id: string, data: Partial<CreateMaterialForm>, userId: string): Promise<IMaterial | null> {
    await connectDB();
    
    if (data.code) {
      const existingCode = await Material.findOne({ code: data.code, _id: { $ne: id } });
      if (existingCode) {
        throw new Error('材料编码已存在');
      }
    }

    if (data.categoryId) {
      const category = await MaterialCategory.findById(data.categoryId);
      if (!category) {
        throw new Error('材料分类不存在');
      }
    }

    const material = await Material.findByIdAndUpdate(
      id,
      { ...data, updatedBy: userId },
      { new: true, runValidators: true }
    ).populate('category');

    return material;
  }

  static async delete(id: string): Promise<boolean> {
    await connectDB();
    
    // 检查是否有库存
    const material = await Material.findById(id);
    if (!material) {
      throw new Error('材料不存在');
    }

    if (material.currentStock > 0) {
      throw new Error('材料有库存，无法删除');
    }

    // 检查是否有未完成的入库单
    const pendingInbound = await InboundItem.findOne({
      materialId: id,
      status: { $in: ['pending', 'partial'] }
    });
    if (pendingInbound) {
      throw new Error('材料存在未完成的入库单，无法删除');
    }

    await Material.findByIdAndDelete(id);
    return true;
  }

  static async updateStock(materialId: string, quantity: number, type: 'inbound' | 'outbound' | 'adjustment', userId: string, referenceId?: string): Promise<void> {
    await connectDB();
    
    try {
      const material = await Material.findById(materialId);
      if (!material) {
        throw new Error('材料不存在');
      }

      const beforeStock = material.currentStock;
      const afterStock = beforeStock + (type === 'outbound' ? -quantity : quantity);

      if (afterStock < 0) {
        throw new Error('库存不足');
      }

      // 更新材料库存
      material.currentStock = afterStock;
      await material.save();

      // 创建库存记录
      const stockRecord = new StockRecord({
        materialId,
        type,
        quantity: Math.abs(quantity),
        beforeStock,
        afterStock,
        referenceId,
        referenceType: type,
        operatedBy: userId,
        operatedAt: new Date()
      });
      await stockRecord.save();
    } catch (error) {
      throw error;
    }
  }
}

export class SupplierService {
  static async getAll(filter: SupplierFilter, pagination: PaginationParams): Promise<PaginatedResponse<ISupplier>> {
    await connectDB();
    
    const query: any = {};
    
    if (filter.status) query.status = filter.status;
    if (filter.keyword) {
      query.$or = [
        { name: { $regex: filter.keyword, $options: 'i' } },
        { code: { $regex: filter.keyword, $options: 'i' } },
        { contactPerson: { $regex: filter.keyword, $options: 'i' } }
      ];
    }

    const skip = (pagination.page - 1) * pagination.pageSize;
    const sort: any = {};
    if (pagination.sortBy) {
      sort[pagination.sortBy] = pagination.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.updatedAt = -1;
    }

    const [items, total] = await Promise.all([
      Supplier.find(query)
        .sort(sort)
        .skip(skip)
        .limit(pagination.pageSize)
        .lean(),
      Supplier.countDocuments(query)
    ]);

    return {
      items,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize)
    };
  }

  static async getById(id: string): Promise<ISupplier | null> {
    await connectDB();
    return Supplier.findById(id).lean();
  }

  static async create(data: CreateSupplierForm, userId: string): Promise<ISupplier> {
    await connectDB();
    
    // 检查编码是否唯一
    const existingCode = await Supplier.findOne({ code: data.code });
    if (existingCode) {
      throw new Error('供应商编码已存在');
    }

    const supplier = new Supplier({
      ...data,
      createdBy: userId
    });

    await supplier.save();
    return supplier.toObject();
  }

  static async update(id: string, data: Partial<CreateSupplierForm>, userId: string): Promise<ISupplier | null> {
    await connectDB();
    
    if (data.code) {
      const existingCode = await Supplier.findOne({ code: data.code, _id: { $ne: id } });
      if (existingCode) {
        throw new Error('供应商编码已存在');
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { ...data, updatedBy: userId },
      { new: true, runValidators: true }
    );

    return supplier?.toObject() || null;
  }

  static async delete(id: string): Promise<boolean> {
    await connectDB();
    
    // 检查是否有关联的入库单
    const relatedInbound = await InboundOrder.findOne({ supplierId: id });
    if (relatedInbound) {
      throw new Error('供应商存在关联的入库单，无法删除');
    }

    const result = await Supplier.findByIdAndDelete(id);
    return !!result;
  }

  static async getOptions(): Promise<Array<{ id: string; name: string; code: string }>> {
    await connectDB();
    return Supplier.find({ status: 'active' })
      .select('name code')
      .sort({ name: 1 })
      .lean()
      .then(suppliers => suppliers.map(s => ({ 
        id: s._id.toString(), 
        name: s.name, 
        code: s.code 
      })));
  }
}

export class InboundService {
  static async getAll(filter: InboundFilter, pagination: PaginationParams): Promise<PaginatedResponse<IInboundOrder>> {
    await connectDB();
    
    const query: any = {};
    
    if (filter.status) query.status = filter.status;
    if (filter.supplierId) query.supplierId = filter.supplierId;
    if (filter.submittedBy) query.submittedBy = filter.submittedBy;
    if (filter.keyword) {
      query.$or = [
        { orderNo: { $regex: filter.keyword, $options: 'i' } },
        { title: { $regex: filter.keyword, $options: 'i' } }
      ];
    }
    if (filter.dateRange) {
      query.createdAt = {
        $gte: filter.dateRange[0],
        $lte: filter.dateRange[1]
      };
    }

    const skip = (pagination.page - 1) * pagination.pageSize;
    const sort: any = {};
    if (pagination.sortBy) {
      sort[pagination.sortBy] = pagination.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.updatedAt = -1;
    }

    const [items, total] = await Promise.all([
      InboundOrder.find(query)
        .populate('supplier')
        .populate('submittedBy', 'username realName')
        .populate('approvedBy', 'username realName')
        .populate('completedBy', 'username realName')
        .sort(sort)
        .skip(skip)
        .limit(pagination.pageSize)
        .lean(),
      InboundOrder.countDocuments(query)
    ]);

    return {
      items,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize)
    };
  }

  static async getById(id: string): Promise<IInboundOrder | null> {
    await connectDB();
    
    const inbound = await InboundOrder.findById(id)
      .populate('supplier')
      .populate('submittedBy', 'username realName')
      .populate('approvedBy', 'username realName')
      .populate('completedBy', 'username realName')
      .lean();

    if (!inbound) return null;

    // 获取入库明细
    const items = await InboundItem.find({ inboundOrderId: id })
      .populate({
        path: 'materialId',
        populate: {
          path: 'category'
        }
      })
      .lean();

    return {
      ...inbound,
      items: items.map(item => ({
        ...item,
        material: item.materialId,
        id: item._id.toString()
      }))
    };
  }

  static async create(data: CreateInboundForm, userId: string): Promise<IInboundOrder> {
    await connectDB();
    
    try {
      // 验证供应商
      const supplier = await Supplier.findById(data.supplierId);
      if (!supplier) {
        throw new Error('供应商不存在');
      }

      // 验证材料并计算总金额
      let totalAmount = 0;
      for (const item of data.items) {
        const material = await Material.findById(item.materialId);
        if (!material) {
          throw new Error(`材料不存在: ${item.materialId}`);
        }
        totalAmount += item.quantity * item.unitPrice;
      }

      // 生成入库单号
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
      const orderNo = `IN${dateStr}${randomStr}`;

      // 创建入库单
      const inboundOrder = new InboundOrder({
        orderNo,
        supplierId: data.supplierId,
        title: data.title,
        remark: data.remark,
        totalAmount,
        submittedBy: userId,
        status: 'draft'
      });

      await inboundOrder.save();

      // 创建入库单明细
      const items = data.items.map(item => ({
        inboundOrderId: inboundOrder._id,
        materialId: item.materialId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        remark: item.remark,
        status: 'pending'
      }));

      await InboundItem.insertMany(items);

      // 返回完整数据
      return this.getById(inboundOrder._id.toString()) as Promise<IInboundOrder>;
    } catch (error) {
      throw error;
    }
  }

  static async submit(id: string, userId: string): Promise<IInboundOrder | null> {
    await connectDB();
    
    const inboundOrder = await InboundOrder.findById(id);
    if (!inboundOrder) {
      throw new Error('入库单不存在');
    }

    if (inboundOrder.status !== 'draft') {
      throw new Error('只能提交草稿状态的入库单');
    }

    // 检查是否有明细
    const itemCount = await InboundItem.countDocuments({ inboundOrderId: id });
    if (itemCount === 0) {
      throw new Error('入库单没有明细，无法提交');
    }

    inboundOrder.status = 'pending';
    inboundOrder.submittedAt = new Date();
    await inboundOrder.save();

    return this.getById(id);
  }

  static async approve(id: string, userId: string): Promise<IInboundOrder | null> {
    await connectDB();
    
    const inboundOrder = await InboundOrder.findById(id);
    if (!inboundOrder) {
      throw new Error('入库单不存在');
    }

    if (inboundOrder.status !== 'pending') {
      throw new Error('只能审批待审核状态的入库单');
    }

    inboundOrder.status = 'approved';
    inboundOrder.approvedBy = userId;
    inboundOrder.approvedAt = new Date();
    await inboundOrder.save();

    return this.getById(id);
  }

  static async reject(id: string, reason: string, userId: string): Promise<IInboundOrder | null> {
    await connectDB();
    
    const inboundOrder = await InboundOrder.findById(id);
    if (!inboundOrder) {
      throw new Error('入库单不存在');
    }

    if (inboundOrder.status !== 'pending') {
      throw new Error('只能拒绝待审核状态的入库单');
    }

    inboundOrder.status = 'rejected';
    inboundOrder.rejectedReason = reason;
    inboundOrder.approvedBy = userId;
    inboundOrder.approvedAt = new Date();
    await inboundOrder.save();

    return this.getById(id);
  }

  static async complete(id: string, actualQuantities: Record<string, number>, userId: string): Promise<IInboundOrder | null> {
    await connectDB();
    
    try {
      const inboundOrder = await InboundOrder.findById(id);
      if (!inboundOrder) {
        throw new Error('入库单不存在');
      }

      if (inboundOrder.status !== 'approved') {
        throw new Error('只能完成已审批的入库单');
      }

      // 获取入库单明细
      const items = await InboundItem.find({ inboundOrderId: id });
      
      // 更新库存和明细
      for (const item of items) {
        const actualQuantity = actualQuantities[item._id.toString()] || item.quantity;
        
        if (actualQuantity > 0) {
          // 更新材料库存
          await MaterialService.updateStock(
            item.materialId.toString(),
            actualQuantity,
            'inbound',
            userId,
            id
          );
        }

        // 更新明细状态
        item.actualQuantity = actualQuantity;
        item.status = actualQuantity === item.quantity ? 'completed' : 'partial';
        await item.save();
      }

      // 更新入库单状态
      inboundOrder.status = 'completed';
      inboundOrder.completedBy = userId;
      inboundOrder.completedAt = new Date();
      await inboundOrder.save();

      return this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    await connectDB();
    
    try {
      const inboundOrder = await InboundOrder.findById(id);
      if (!inboundOrder) {
        throw new Error('入库单不存在');
      }

      if (inboundOrder.status === 'completed') {
        throw new Error('已完成的入库单无法删除');
      }

      // 删除明细
      await InboundItem.deleteMany({ inboundOrderId: id });
      
      // 删除入库单
      await InboundOrder.findByIdAndDelete(id);

      return true;
    } catch (error) {
      throw error;
    }
  }
}

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMaterials,
      totalSuppliers,
      pendingInbounds,
      lowStockMaterials,
      totalValue,
      monthlyInbounds,
      recentActivities
    ] = await Promise.all([
      Material.countDocuments({ status: 'active' }),
      Supplier.countDocuments({ status: 'active' }),
      InboundOrder.countDocuments({ status: 'pending' }),
      Material.countDocuments({ 
        status: 'active',
        $expr: { $lte: ['$currentStock', '$minStock'] }
      }),
      Material.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$currentStock', '$price'] } } } }
      ]).then(result => result[0]?.total || 0),
      InboundOrder.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: 'completed' } },
        { $group: { 
          _id: null, 
          count: { $sum: 1 },
          value: { $sum: '$totalAmount' }
        }}
      ]).then(result => result[0] || { count: 0, value: 0 }),
      this.getRecentActivities()
    ]);

    return {
      totalMaterials,
      totalSuppliers,
      pendingInbounds,
      lowStockMaterials,
      totalValue,
      monthlyInboundCount: monthlyInbounds.count,
      monthlyInboundValue: monthlyInbounds.value,
      recentActivities
    };
  }

  private static async getRecentActivities(): Promise<RecentActivity[]> {
    // 获取最近的操作记录
    const recentInbounds = await InboundOrder.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('supplier')
      .lean();

    const activities: RecentActivity[] = [];

    for (const inbound of recentInbounds) {
      let type: RecentActivity['type'];
      let description: string;

      switch (inbound.status) {
        case 'pending':
          type = 'inbound_created';
          description = `创建了入库单 ${inbound.orderNo}`;
          break;
        case 'approved':
          type = 'inbound_approved';
          description = `审批通过了入库单 ${inbound.orderNo}`;
          break;
        case 'completed':
          type = 'inbound_completed';
          description = `完成了入库单 ${inbound.orderNo}`;
          break;
        default:
          continue;
      }

      activities.push({
        id: inbound._id.toString(),
        type,
        title: inbound.title,
        description,
        userId: inbound.submittedBy.toString(),
        userName: '系统用户', // TODO: 从用户表获取真实姓名
        createdAt: inbound.updatedAt
      });
    }

    return activities.slice(0, 5);
  }
}
