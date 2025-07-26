import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { username, password } = body;

    // 输入验证
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '用户名和密码都是必填项' },
        { status: 400 }
      );
    }

    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      $or: [
        { username: username.trim() },
        { email: username.toLowerCase().trim() }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 检查用户是否被禁用
    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '账户已被禁用，请联系管理员' },
        { status: 403 }
      );
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // 准备返回的用户信息（不包含密码）
    const userResponse = {
      id: user._id.toString(), // 确保转换为string
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

    // 创建响应
    const response = NextResponse.json(
      {
        success: true,
        message: '登录成功',
        user: userResponse,
        token,
      },
      { status: 200 }
    );

    // 设置 HTTP-only cookie （更安全的方式存储 token）
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 天
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}
