import { NextRequest, NextResponse } from 'next/server';
import { InboundOrder, InboundItem, Supplier } from '@/models';
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
    const type = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // 构建日期过滤条件
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    switch (type) {
      case 'overview':
        // 入库概览统计
        const overview = await getInboundOverview(dateFilter);
        return NextResponse.json({
          success: true,
          data: overview
        });
        
      case 'supplier':
        // 按供应商统计
        const supplierStats = await getInboundBySupplier(dateFilter);
        return NextResponse.json({
          success: true,
          data: supplierStats
        });
        
      case 'monthly':
        // 按月统计
        const monthlyStats = await getInboundByMonth();
        return NextResponse.json({
          success: true,
          data: monthlyStats
        });
        
      case 'status':
        // 按状态统计
        const statusStats = await getInboundByStatus(dateFilter);
        return NextResponse.json({
          success: true,
          data: statusStats
        });
        
      default:
        return NextResponse.json(
          { success: false, error: '不支持的统计类型' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('获取入库统计失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取入库统计失败' },
      { status: 500 }
    );
  }
}

// 入库概览统计
async function getInboundOverview(dateFilter: any) {
  const stats = await InboundOrder.aggregate([
    { $match: { ...dateFilter } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejectedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        completedAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0]
          }
        },
        averageAmount: { $avg: '$totalAmount' }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalOrders: 0,
    totalAmount: 0,
    completedOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    completedAmount: 0,
    averageAmount: 0
  };
  
  // 计算完成率
  result.completionRate = result.totalOrders > 0 
    ? (result.completedOrders / result.totalOrders * 100).toFixed(2)
    : '0.00';
    
  return result;
}

// 按供应商统计入库
async function getInboundBySupplier(dateFilter: any) {
  const supplierStats = await InboundOrder.aggregate([
    { $match: { ...dateFilter } },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierId',
        foreignField: '_id',
        as: 'supplier'
      }
    },
    { $unwind: '$supplier' },
    {
      $group: {
        _id: '$supplierId',
        supplierName: { $first: '$supplier.name' },
        supplierCode: { $first: '$supplier.code' },
        orderCount: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        completedAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0]
          }
        },
        averageAmount: { $avg: '$totalAmount' },
        lastOrderDate: { $max: '$createdAt' }
      }
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 20 }
  ]);
  
  return supplierStats.map(stat => ({
    ...stat,
    completionRate: stat.orderCount > 0 
      ? (stat.completedOrders / stat.orderCount * 100).toFixed(2)
      : '0.00'
  }));
}

// 按月统计入库
async function getInboundByMonth() {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  
  const monthlyStats = await InboundOrder.aggregate([
    {
      $match: {
        createdAt: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        orderCount: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        completedAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
  
  // 填充缺失的月份数据
  const result = [];
  const startDate = new Date(twelveMonthsAgo);
  
  for (let i = 0; i < 12; i++) {
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    const existing = monthlyStats.find(stat => 
      stat._id.year === year && stat._id.month === month
    );
    
    result.push({
      year,
      month,
      monthLabel: `${year}-${month.toString().padStart(2, '0')}`,
      orderCount: existing?.orderCount || 0,
      totalAmount: existing?.totalAmount || 0,
      completedOrders: existing?.completedOrders || 0,
      completedAmount: existing?.completedAmount || 0,
      completionRate: existing?.orderCount > 0 
        ? (existing.completedOrders / existing.orderCount * 100).toFixed(2)
        : '0.00'
    });
  }
  
  return result;
}

// 按状态统计入库
async function getInboundByStatus(dateFilter: any) {
  const statusStats = await InboundOrder.aggregate([
    { $match: { ...dateFilter } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        averageAmount: { $avg: '$totalAmount' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // 状态映射
  const statusMap = {
    draft: '草稿',
    pending: '待审核',
    approved: '已审批',
    rejected: '已拒绝',
    completed: '已完成'
  };
  
  return statusStats.map(stat => ({
    status: stat._id,
    statusLabel: statusMap[stat._id as keyof typeof statusMap] || stat._id,
    count: stat.count,
    totalAmount: stat.totalAmount,
    averageAmount: stat.averageAmount
  }));
}
