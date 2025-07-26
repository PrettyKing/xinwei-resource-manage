import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/business';
import { UpdateUserForm } from '@/types/business';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface Params {
  id: string;
}

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

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const currentUser = verifyToken(request);

    // 检查权限 - 只有管理员可以查看用户详情
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const user = await UserService.getById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取用户详情失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const currentUser = verifyToken(request);

    // 检查权限 - 只有管理员可以更新用户
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const data: UpdateUserForm = await request.json();
    
    // 验证邮箱格式（如果提供）
    if (data.email && data.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json(
          { success: false, error: '请输入正确的邮箱地址' },
          { status: 400 }
        );
      }
    }

    // 验证角色（如果提供）
    if (data.role && !['admin', 'manager', 'operator'].includes(data.role)) {
      return NextResponse.json(
        { success: false, error: '无效的用户角色' },
        { status: 400 }
      );
    }

    // 如果提供了新密码，进行验证和加密
    let updateData = { ...data };
    if (data.password && data.password.trim()) {
      if (data.password.length < 6) {
        return NextResponse.json(
          { success: false, error: '密码长度至少6位' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(data.password, 12);
    } else {
      // 如果没有提供密码，从更新数据中移除密码字段
      delete updateData.password;
    }

    const user = await UserService.update(params.id, updateData, currentUser.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user,
      message: '用户更新成功'
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '更新用户失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const currentUser = verifyToken(request);

    // 检查权限 - 只有管理员可以删除用户
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    // 防止删除自己
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { success: false, error: '不能删除自己的账户' },
        { status: 400 }
      );
    }

    await UserService.delete(params.id);
    
    return NextResponse.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '删除用户失败' },
      { status: 500 }
    );
  }
}
