import { NextRequest, NextResponse } from 'next/server';
import { MaterialService } from '@/services/business';
import { CreateMaterialForm } from '@/types/business';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params {
  id: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

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
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取材料详情失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

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

    const material = await MaterialService.update(params.id, data, session.user.id);
    
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
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '更新材料失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 检查权限 - 只有管理员可以删除
    if (session.user.role !== 'admin' && session.user.role !== 'manager') {
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
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '删除材料失败' },
      { status: 500 }
    );
  }
}
