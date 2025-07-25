import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { username, password } = body;

    // 输入验证
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码都是必填项' },
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
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return NextResponse.json(
        { error: '账户已被禁用，请联系管理员' },
        { status: 403 }
      );
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成 JWT token
    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    // 准备返回的用户信息（不包含密码）
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    // 创建响应
    const response = NextResponse.json(
      {
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
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}
