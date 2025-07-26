import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // 从Authorization header获取token
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        { success: false, error: '缺少认证令牌' },
        { status: 401 }
      );
    }

    const token = authorization.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: '无效的认证令牌' },
        { status: 401 }
      );
    }

    try {
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // 根据token中的用户ID查找用户
      const user = await User.findById(decoded.id);
      if (!user) {
        return NextResponse.json(
          { success: false, error: '用户不存在' },
          { status: 401 }
        );
      }

      // 检查用户是否被禁用
      if (user.status !== 'active') {
        return NextResponse.json(
          { success: false, error: '账户已被禁用' },
          { status: 403 }
        );
      }

      // 准备返回的用户信息（不包含密码）
      const userResponse = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        realName: user.realName,
        phone: user.phone,
        isActive: user.status === 'active', // 兼容字段
        lastLogin: user.lastLoginAt, // 兼容字段
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return NextResponse.json({
        success: true,
        user: userResponse
      });

    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: '认证令牌已过期或无效' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('验证用户信息错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
