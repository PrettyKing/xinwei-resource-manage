import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/business';
import { User } from '@/models';
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
    const currentUser = verifyToken(request);

    // 检查权限 - 只有管理员可以查看用户统计
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    // 获取用户统计数据
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      managerUsers,
      operatorUsers,
      recentUsers,
      usersByMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'operator' }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-password')
        .lean(),
      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 }
        },
        {
          $limit: 12
        }
      ])
    ]);

    const stats = {
      overview: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers
      },
      byRole: {
        admin: adminUsers,
        manager: managerUsers,
        operator: operatorUsers
      },
      recentUsers: recentUsers.map((user:any) => ({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      })),
      growth: usersByMonth.map(item => ({
        year: item._id.year,
        month: item._id.month,
        count: item.count,
        label: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      })).reverse()
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取用户统计失败' },
      { status: 500 }
    );
  }
}
