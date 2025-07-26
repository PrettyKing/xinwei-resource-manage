import { NextRequest, NextResponse } from 'next/server';
import { MaterialService } from '@/services/business';
import { CreateMaterialForm, MaterialFilter, PaginationParams } from '@/types/business';
import jwt from 'jsonwebtoken';

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

    const { searchParams } = new URL(request.url);
    
    // 解析分页参数
    const pagination: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    };

    // 解析过滤条件
    const filter: MaterialFilter = {
      categoryId: searchParams.get('categoryId') || undefined,
      status: (searchParams.get('status') as 'active' | 'inactive') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      lowStock: searchParams.get('lowStock') === 'true'
    };

    const result = await MaterialService.getAll(filter, pagination);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取材料列表失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取材料列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);

    const data: CreateMaterialForm = await request.json();
    
    // 数据验证
    if (!data.name || !data.code || !data.categoryId || !data.specification || !data.unit) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    if (data.minStock < 0 || data.maxStock < 0 || data.price < 0) {
      return NextResponse.json(
        { success: false, error: '数值不能为负数' },
        { status: 400 }
      );
    }

    if (data.maxStock < data.minStock) {
      return NextResponse.json(
        { success: false, error: '最大库存不能小于最小库存' },
        { status: 400 }
      );
    }

    const material = await MaterialService.create(data, user.id);
    
    return NextResponse.json({
      success: true,
      data: material,
      message: '材料创建成功'
    });
  } catch (error) {
    console.error('创建材料失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '创建材料失败' },
      { status: 500 }
    );
  }
}
