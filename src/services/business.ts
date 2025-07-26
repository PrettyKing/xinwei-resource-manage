  static async create(data: CreateInboundForm, userId: string): Promise<IInboundOrder> {
    await connectDB();
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 验证供应商
      const supplier = await Supplier.findById(data.supplierId).session(session);
      if (!supplier) {
        throw new Error('供应商不存在');
      }

      // 验证材料并计算总金额
      let totalAmount = 0;
      for (const item of data.items) {
        const material = await Material.findById(item.materialId).session(session);
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

      // 创建入库单 - 直接使用字符串，Mongoose会自动转换
      const inboundOrder = new InboundOrder({
        orderNo,
        supplierId: data.supplierId,
        title: data.title,
        remark: data.remark,
        totalAmount,
        submittedBy: userId,
        status: 'draft'
      });

      await inboundOrder.save({ session });

      // 创建入库单明细 - 直接使用字符串
      const items = data.items.map(item => ({
        inboundOrderId: inboundOrder._id,
        materialId: item.materialId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        remark: item.remark,
        status: 'pending'
      }));

      await InboundItem.insertMany(items, { session });

      await session.commitTransaction();
      
      // 返回完整数据
      return this.getById(inboundOrder._id.toString()) as Promise<IInboundOrder>;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }