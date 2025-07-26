import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/business';
import { CreateUserForm, UserFilter, PaginationParams } from '@/types/business';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

    // 检查权限 - 只有管理员可以管理用户
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // 解析分页参数
    const pagination: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    };

    // 解析过滤条件
    const filter: UserFilter = {
      role: (searchParams.get('role') as 'admin' | 'manager' | 'operator') || undefined,
      status: (searchParams.get('status') as 'active' | 'inactive') || undefined,
      keyword: searchParams.get('keyword') || undefined,
    };

    const result = await UserService.getAll(filter, pagination);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取用户列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = verifyToken(request);

    // 检查权限 - 只有管理员可以创建用户
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const data: CreateUserForm = await request.json();
    
    // 数据验证
    if (!data.username || !data.password || !data.email || !data.role) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 验证用户名格式
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
      return NextResponse.json(
        { success: false, error: '用户名只能包含字母、数字和下划线，长度3-20位' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (data.password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少6位' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, error: '请输入正确的邮箱地址' },
        { status: 400 }
      );
    }

    // 验证角色
    if (!['admin', 'manager', 'operator'].includes(data.role)) {
      return NextResponse.json(
        { success: false, error: '无效的用户角色' },
        { status: 400 }
      );
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const userData = {
      ...data,
      password: hashedPassword
    };

    const newUser = await UserService.create(userData, currentUser.id);
    
    return NextResponse.json({
      success: true,
      data: newUser,
      message: '用户创建成功'
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '创建用户失败' },
      { status: 500 }
    );
  }
}
