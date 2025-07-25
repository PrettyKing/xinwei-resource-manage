import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // 检查是否已有管理员
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { error: '系统已存在管理员账号' },
        { status: 409 }
      );
    }

    // 检查是否已有用户
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return NextResponse.json(
        { error: '系统中已有用户，无法创建初始管理员' },
        { status: 409 }
      );
    }

    // 创建默认管理员账号
    const defaultAdmin = {
      username: 'admin',
      email: 'admin@xinwei.com',
      password: '123456',
      role: 'admin' as const,
    };

    const hashedPassword = await hashPassword(defaultAdmin.password);

    const adminUser = new User({
      username: defaultAdmin.username,
      email: defaultAdmin.email,
      password: hashedPassword,
      role: defaultAdmin.role,
      isActive: true,
    });

    await adminUser.save();

    return NextResponse.json(
      {
        message: '初始管理员账号创建成功',
        admin: {
          username: defaultAdmin.username,
          email: defaultAdmin.email,
          role: defaultAdmin.role,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('创建初始管理员账号错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // 检查系统状态
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    return NextResponse.json({
      userCount,
      adminCount,
      needsInitialization: userCount === 0,
      hasAdmin: adminCount > 0,
    });
    
  } catch (error) {
    console.error('获取系统状态错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
