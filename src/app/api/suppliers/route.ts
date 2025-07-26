import { NextRequest, NextResponse } from 'next/server';
import { SupplierService } from '@/services/business';
import { CreateSupplierForm, SupplierFilter, PaginationParams } from '@/types/business';
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
    const filter: SupplierFilter = {
      status: (searchParams.get('status') as 'active' | 'inactive') || undefined,
      keyword: searchParams.get('keyword') || undefined,
    };

    // 如果只是获取选项列表
    if (searchParams.get('options') === 'true') {
      const options = await SupplierService.getOptions();
      return NextResponse.json({
        success: true,
        data: options
      });
    }

    const result = await SupplierService.getAll(filter, pagination);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取供应商列表失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取供应商列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);

    const data: CreateSupplierForm = await request.json();
    
    // 数据验证
    if (!data.name || !data.code || !data.contactPerson || !data.phone || !data.address) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(data.phone)) {
      return NextResponse.json(
        { success: false, error: '请输入正确的手机号码' },
        { status: 400 }
      );
    }

    // 验证邮箱格式（如果提供）
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json(
        { success: false, error: '请输入正确的邮箱地址' },
        { status: 400 }
      );
    }

    const supplier = await SupplierService.create(data, user.id);
    
    return NextResponse.json({
      success: true,
      data: supplier,
      message: '供应商创建成功'
    });
  } catch (error) {
    console.error('创建供应商失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '创建供应商失败' },
      { status: 500 }
    );
  }
}
