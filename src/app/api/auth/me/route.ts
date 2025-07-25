import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const decoded = await authenticateUser(request);
    
    // 连接数据库
    await connectToDatabase();
    
    // 获取用户最新信息
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: '账户已被禁用' },
        { status: 403 }
      );
    }

    // 返回用户信息
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      { user: userResponse },
      { status: 200 }
    );

  } catch (error) {
    console.error('获取用户信息错误:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('token')) {
        return NextResponse.json(
          { error: '认证失败，请重新登录' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
