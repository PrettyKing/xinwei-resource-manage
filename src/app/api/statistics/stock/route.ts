import { NextRequest, NextResponse } from 'next/server';
import { Material, MaterialCategory } from '@/models';
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
    
    switch (type) {
      case 'overview':
        // 库存概览统计
        const overview = await getStockOverview();
        return NextResponse.json({
          success: true,
          data: overview
        });
        
      case 'category':
        // 按分类统计
        const categoryStats = await getStockByCategory();
        return NextResponse.json({
          success: true,
          data: categoryStats
        });
        
      case 'lowStock':
        // 低库存预警
        const lowStockItems = await getLowStockItems();
        return NextResponse.json({
          success: true,
          data: lowStockItems
        });
        
      case 'trend':
        // 库存趋势（最近30天）
        const trendData = await getStockTrend();
        return NextResponse.json({
          success: true,
          data: trendData
        });
        
      default:
        return NextResponse.json(
          { success: false, error: '不支持的统计类型' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('获取库存统计失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取库存统计失败' },
      { status: 500 }
    );
  }
}

// 库存概览统计
async function getStockOverview() {
  const stats = await Material.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$currentStock', '$price'] } },
        totalQuantity: { $sum: '$currentStock' },
        lowStockCount: {
          $sum: {
            $cond: [{ $lte: ['$currentStock', '$minStock'] }, 1, 0]
          }
        },
        outOfStockCount: {
          $sum: {
            $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
          }
        },
        averageValue: { $avg: { $multiply: ['$currentStock', '$price'] } }
      }
    }
  ]);
  
  return stats[0] || {
    totalItems: 0,
    totalValue: 0,
    totalQuantity: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    averageValue: 0
  };
}

// 按分类统计库存
async function getStockByCategory() {
  const categoryStats = await Material.aggregate([
    { $match: { status: 'active' } },
    {
      $lookup: {
        from: 'materialcategories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$category' },
    {
      $group: {
        _id: '$categoryId',
        categoryName: { $first: '$category.name' },
        categoryCode: { $first: '$category.code' },
        itemCount: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$currentStock', '$price'] } },
        totalQuantity: { $sum: '$currentStock' },
        lowStockCount: {
          $sum: {
            $cond: [{ $lte: ['$currentStock', '$minStock'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { totalValue: -1 } }
  ]);
  
  return categoryStats;
}

// 低库存预警列表
async function getLowStockItems() {
  const lowStockItems = await Material.find({
    status: 'active',
    $expr: { $lte: ['$currentStock', '$minStock'] }
  })
  .populate('category', 'name code')
  .select('name code currentStock minStock unit price category')
  .sort({ currentStock: 1 })
  .limit(50)
  .lean();
  
  return lowStockItems.map(item => ({
    ...item,
    stockRatio: item.minStock > 0 ? (item.currentStock / item.minStock) : 0,
    urgency: item.currentStock === 0 ? 'critical' : 
             item.currentStock < item.minStock * 0.5 ? 'high' : 'medium'
  }));
}

// 库存趋势数据（最近30天）
async function getStockTrend() {
  // 这里需要从库存记录表中获取趋势数据
  // 为了简化，我们返回模拟数据
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // 生成最近30天的日期数组
  const dates = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push({
      date: date.toISOString().split('T')[0],
      inbound: Math.floor(Math.random() * 100),
      outbound: Math.floor(Math.random() * 80),
      adjustment: Math.floor(Math.random() * 20) - 10
    });
  }
  
  return dates;
}
