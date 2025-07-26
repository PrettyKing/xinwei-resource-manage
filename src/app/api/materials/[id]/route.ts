import { NextRequest, NextResponse } from 'next/server';
import { MaterialService } from '@/services/business';
import { CreateMaterialForm } from '@/types/business';
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

    const material = await MaterialService.getById(params.id);
    
    if (!material) {
      return NextResponse.json(
        { success: false, error: '材料不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('获取材料详情失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取材料详情失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = verifyToken(request);

    const data: Partial<CreateMaterialForm> = await request.json();
    
    // 数据验证
    if (data.minStock !== undefined && data.minStock < 0) {
      return NextResponse.json(
        { success: false, error: '最小库存不能为负数' },
        { status: 400 }
      );
    }

    if (data.maxStock !== undefined && data.maxStock < 0) {
      return NextResponse.json(
        { success: false, error: '最大库存不能为负数' },
        { status: 400 }
      );
    }

    if (data.price !== undefined && data.price < 0) {
      return NextResponse.json(
        { success: false, error: '价格不能为负数' },
        { status: 400 }
      );
    }

    if (data.maxStock !== undefined && data.minStock !== undefined && data.maxStock < data.minStock) {
      return NextResponse.json(
        { success: false, error: '最大库存不能小于最小库存' },
        { status: 400 }
      );
    }

    const material = await MaterialService.update(params.id, data, user.id);
    
    if (!material) {
      return NextResponse.json(
        { success: false, error: '材料不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: material,
      message: '材料更新成功'
    });
  } catch (error) {
    console.error('更新材料失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '更新材料失败' },
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

    await MaterialService.delete(params.id);
    
    return NextResponse.json({
      success: true,
      message: '材料删除成功'
    });
  } catch (error) {
    console.error('删除材料失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '删除材料失败' },
      { status: 500 }
    );
  }
}
