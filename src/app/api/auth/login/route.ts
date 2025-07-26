import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { username, password } = body;

    console.log('登录尝试:', { username, password: '***' });

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

    console.log('找到用户:', user ? { id: user._id, username: user.username, email: user.email } : '未找到');

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    console.log('用户状态:', user.status);

    // 检查用户是否被禁用
    if (user.status && user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '账户已被禁用，请联系管理员' },
        { status: 403 }
      );
    }

    // 验证密码 - 先尝试直接比较，再尝试bcrypt
    let isPasswordValid = false;
    
    try {
      // 如果用户模型有comparePassword方法，使用它
      if (typeof user.comparePassword === 'function') {
        isPasswordValid = await user.comparePassword(password);
        console.log('使用comparePassword验证:', isPasswordValid);
      } else {
        // 否则使用bcrypt直接比较
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('使用bcrypt直接验证:', isPasswordValid);
      }
    } catch (error) {
      console.error('密码验证错误:', error);
      // 如果加密验证失败，尝试明文比较（用于测试）
      isPasswordValid = password === user.password;
      console.log('明文密码验证:', isPasswordValid);
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 更新最后登录时间
    try {
      if (user.lastLoginAt !== undefined) {
        user.lastLoginAt = new Date();
      } else {
        user.lastLogin = new Date();
      }
      await user.save();
    } catch (error) {
      console.error('更新登录时间失败:', error);
      // 不影响登录流程
    }

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
      status: user.status || 'active',
      realName: user.realName,
      phone: user.phone,
      isActive: (user.status || 'active') === 'active', // 兼容字段
      lastLogin: user.lastLoginAt || user.lastLogin, // 兼容字段
      lastLoginAt: user.lastLoginAt || user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log('登录成功，返回用户信息:', { id: userResponse.id, username: userResponse.username });

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

    // 设置 HTTP-only cookie
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
