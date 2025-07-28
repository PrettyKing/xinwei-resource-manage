import { NextRequest, NextResponse } from 'next/server';
import { Material, InboundOrder, Supplier, StockRecord } from '@/models';
import { connectDB } from '@/lib/db';
import jwt from 'jsonwebtoken';

// 验证 JWT Token
function verifyToken(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    throw new Error('缺少认证令牌');
  }

  const token = authorization.replace('Bearer ', '');
  if (!token) {
    throw new Error('无效的认证令牌');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded;
  } catch (error) {
    throw new Error('认证令牌已过期或无效');
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'inventory';
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let reportData;
    
    switch (type) {
      case 'inventory':
        // 库存报表
        reportData = await generateInventoryReport();
        break;
        
      case 'inbound':
        // 入库报表
        reportData = await generateInboundReport(startDate, endDate);
        break;
        
      case 'supplier':
        // 供应商报表
        reportData = await generateSupplierReport(startDate, endDate);
        break;
        
      case 'stockMovement':
        // 库存流水报表
        reportData = await generateStockMovementReport(startDate, endDate);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: '不支持的报表类型' },
          { status: 400 }
        );
    }
    
    if (format === 'csv') {
      // 返回CSV格式
      const csv = convertToCSV(reportData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('生成报表失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '生成报表失败' },
      { status: 500 }
    );
  }
}

// 生成库存报表
async function generateInventoryReport() {
  const materials = await Material.find({ status: 'active' })
    .populate('category', 'name code')
    .select('name code specification unit currentStock minStock maxStock price category')
    .sort({ 'category.name': 1, name: 1 })
    .lean();
    
  return {
    title: '库存报表',
    generatedAt: new Date().toISOString(),
    summary: {
      totalItems: materials.length,
      totalValue: materials.reduce((sum, item) => sum + (item.currentStock * item.price), 0),
      lowStockItems: materials.filter(item => item.currentStock <= item.minStock).length
    },
    data: materials.map(material => ({
      id: material._id.toString(),
      name: material.name,
      code: material.code,
      categoryName: material.category?.name || '-',
      specification: material.specification,
      unit: material.unit,
      currentStock: material.currentStock,
      minStock: material.minStock,
      maxStock: material.maxStock,
      price: material.price,
      stockValue: material.currentStock * material.price,
      stockStatus: material.currentStock === 0 ? '缺货' :
                   material.currentStock <= material.minStock ? '低库存' :
                   material.currentStock >= material.maxStock ? '超储' : '正常',
      stockLevel: material.minStock > 0 ? 
                  ((material.currentStock / material.minStock) * 100).toFixed(2) + '%' : '-'
    }))
  };
}

// 生成入库报表
async function generateInboundReport(startDate?: string | null, endDate?: string | null) {
  const dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const inboundOrders = await InboundOrder.find(dateFilter)
    .populate('supplier', 'name code')
    .populate('submittedBy', 'username realName')
    .populate('approvedBy', 'username realName')
    .populate('completedBy', 'username realName')
    .sort({ createdAt: -1 })
    .lean();
    
  const totalAmount = inboundOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const completedOrders = inboundOrders.filter(order => order.status === 'completed');
  
  return {
    title: '入库报表',
    period: startDate && endDate ? `${startDate} 至 ${endDate}` : '全部',
    generatedAt: new Date().toISOString(),
    summary: {
      totalOrders: inboundOrders.length,
      totalAmount,
      completedOrders: completedOrders.length,
      completedAmount: completedOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      completionRate: inboundOrders.length > 0 ? 
                     ((completedOrders.length / inboundOrders.length) * 100).toFixed(2) + '%' : '0%'
    },
    data: inboundOrders.map(order => ({
      id: order._id.toString(),
      orderNo: order.orderNo,
      title: order.title,
      supplierName: order.supplier?.name || '-',
      supplierCode: order.supplier?.code || '-',
      totalAmount: order.totalAmount,
      status: order.status,
      statusLabel: getStatusLabel(order.status),
      submittedBy: order.submittedBy?.realName || order.submittedBy?.username || '-',
      submittedAt: order.submittedAt ? formatDate(order.submittedAt) : '-',
      approvedBy: order.approvedBy?.realName || order.approvedBy?.username || '-',
      approvedAt: order.approvedAt ? formatDate(order.approvedAt) : '-',
      completedBy: order.completedBy?.realName || order.completedBy?.username || '-',
      completedAt: order.completedAt ? formatDate(order.completedAt) : '-',
      createdAt: formatDate(order.createdAt),
      remark: order.remark || '-'
    }))
  };
}

// 生成供应商报表
async function generateSupplierReport(startDate?: string | null, endDate?: string | null) {
  const dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const suppliers = await Supplier.find({ status: 'active' })
    .select('name code contactPerson phone email address')
    .sort({ name: 1 })
    .lean();
    
  // 获取每个供应商的入库统计
  const supplierStats = await InboundOrder.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$supplierId',
        orderCount: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        lastOrderDate: { $max: '$createdAt' }
      }
    }
  ]);
  
  const statsMap = new Map(supplierStats.map(stat => [stat._id.toString(), stat]));
  
  return {
    title: '供应商报表',
    period: startDate && endDate ? `${startDate} 至 ${endDate}` : '全部',
    generatedAt: new Date().toISOString(),
    summary: {
      totalSuppliers: suppliers.length,
      activeSuppliers: supplierStats.length,
      totalOrders: supplierStats.reduce((sum, stat) => sum + stat.orderCount, 0),
      totalAmount: supplierStats.reduce((sum, stat) => sum + stat.totalAmount, 0)
    },
    data: suppliers.map(supplier => {
      const stats = statsMap.get(supplier._id.toString());
      return {
        id: supplier._id.toString(),
        name: supplier.name,
        code: supplier.code,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email || '-',
        address: supplier.address,
        orderCount: stats?.orderCount || 0,
        totalAmount: stats?.totalAmount || 0,
        completedOrders: stats?.completedOrders || 0,
        completionRate: stats?.orderCount > 0 ? 
                       ((stats.completedOrders / stats.orderCount) * 100).toFixed(2) + '%' : '0%',
        lastOrderDate: stats?.lastOrderDate ? formatDate(stats.lastOrderDate) : '-'
      };
    })
  };
}

// 生成库存流水报表
async function generateStockMovementReport(startDate?: string | null, endDate?: string | null) {
  const dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter.operatedAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const stockRecords = await StockRecord.find(dateFilter)
    .populate('materialId', 'name code unit')
    .populate('operatedBy', 'username realName')
    .sort({ operatedAt: -1 })
    .limit(1000) // 限制返回数量
    .lean();
    
  const summary = stockRecords.reduce((acc, record) => {
    acc.totalRecords++;
    if (record.type === 'inbound') acc.inboundRecords++;
    if (record.type === 'outbound') acc.outboundRecords++;
    if (record.type === 'adjustment') acc.adjustmentRecords++;
    return acc;
  }, {
    totalRecords: 0,
    inboundRecords: 0,
    outboundRecords: 0,
    adjustmentRecords: 0
  });
  
  return {
    title: '库存流水报表',
    period: startDate && endDate ? `${startDate} 至 ${endDate}` : '最近1000条记录',
    generatedAt: new Date().toISOString(),
    summary,
    data: stockRecords.map(record => ({
      id: record._id.toString(),
      materialName: record.materialId?.name || '-',
      materialCode: record.materialId?.code || '-',
      unit: record.materialId?.unit || '-',
      type: record.type,
      typeLabel: getTypeLabel(record.type),
      quantity: record.quantity,
      beforeStock: record.beforeStock,
      afterStock: record.afterStock,
      stockChange: record.afterStock - record.beforeStock,
      operatedBy: record.operatedBy?.realName || record.operatedBy?.username || '-',
      operatedAt: formatDate(record.operatedAt),
      description: record.description || '-'
    }))
  };
}

// 辅助函数
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已审批',
    rejected: '已拒绝',
    completed: '已完成'
  };
  return statusMap[status] || status;
}

function getTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    inbound: '入库',
    outbound: '出库',
    adjustment: '调整'
  };
  return typeMap[type] || type;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 转换为CSV格式
function convertToCSV(reportData: any): string {
  if (!reportData.data || reportData.data.length === 0) {
    return '暂无数据';
  }
  
  const headers = Object.keys(reportData.data[0]);
  const csvContent = [
    // CSV头部信息
    `# ${reportData.title}`,
    `# 生成时间: ${formatDate(new Date(reportData.generatedAt))}`,
    reportData.period ? `# 时间范围: ${reportData.period}` : '',
    '',
    // 表头
    headers.join(','),
    // 数据行
    ...reportData.data.map((row: any) => 
      headers.map(header => {
        const value = row[header];
        // 处理包含逗号的值
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',')
    )
  ].filter(line => line !== '').join('\n');
  
  return csvContent;
}
