import { NextRequest, NextResponse } from 'next/server';
import { SupplierService } from '@/services/business';
import { CreateSupplierForm } from '@/types/business';
import jwt from 'jsonwebtoken';

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
    const user = verifyToken(request);

    const supplier = await SupplierService.getById(params.id);
    
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: '供应商不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('获取供应商详情失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取供应商详情失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = verifyToken(request);

    const data: Partial<CreateSupplierForm> = await request.json();
    
    // 数据验证
    if (data.phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(data.phone)) {
        return NextResponse.json(
          { success: false, error: '请输入正确的手机号码' },
          { status: 400 }
        );
      }
    }

    if (data.email && data.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json(
          { success: false, error: '请输入正确的邮箱地址' },
          { status: 400 }
        );
      }
    }

    const supplier = await SupplierService.update(params.id, data, user.id);
    
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: '供应商不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: supplier,
      message: '供应商更新成功'
    });
  } catch (error) {
    console.error('更新供应商失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '更新供应商失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = verifyToken(request);

    // 检查权限 - 只有管理员可以删除
    if (user.role !== 'admin' && user.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    await SupplierService.delete(params.id);
    
    return NextResponse.json({
      success: true,
      message: '供应商删除成功'
    });
  } catch (error) {
    console.error('删除供应商失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '删除供应商失败' },
      { status: 500 }
    );
  }
}
