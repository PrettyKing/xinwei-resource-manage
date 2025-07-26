import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models';
import { connectDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // 检查是否已有管理员用户
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: '系统中已存在管理员用户' },
        { status: 400 }
      );
    }

    const { username, email, password, realName } = await request.json();

    // 验证必填字段
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: '用户名、邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证用户名格式
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        { success: false, error: '用户名只能包含字母、数字和下划线，长度3-20位' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少6位' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '请输入正确的邮箱地址' },
        { status: 400 }
      );
    }

    // 检查用户名和邮箱是否已存在
    const [existingUsername, existingEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email })
    ]);

    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: '用户名已存在' },
        { status: 400 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: '邮箱已存在' },
        { status: 400 }
      );
    }

    // 创建初始管理员
    const adminUser = new User({
      username,
      email,
      password, // 密码会在保存时自动加密
      role: 'admin',
      status: 'active',
      realName: realName || '系统管理员'
    });

    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: '初始管理员创建成功',
      data: {
        id: adminUser._id.toString(),
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.status
      }
    });

  } catch (error) {
    console.error('创建初始管理员失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '创建初始管理员失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // 检查是否已有管理员用户
    const adminCount = await User.countDocuments({ role: 'admin' });
    const totalUsers = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      data: {
        hasAdmin: adminCount > 0,
        adminCount,
        totalUsers,
        needsInitialization: adminCount === 0
      }
    });
  } catch (error) {
    console.error('检查系统状态失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '检查系统状态失败' },
      { status: 500 }
    );
  }
}
