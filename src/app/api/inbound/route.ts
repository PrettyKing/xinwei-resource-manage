import { NextRequest, NextResponse } from 'next/server';
import { InboundService } from '@/services/business';
import { CreateInboundForm, InboundFilter, PaginationParams } from '@/types/business';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
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
    const filter: InboundFilter = {
      status: searchParams.get('status') as any || undefined,
      supplierId: searchParams.get('supplierId') || undefined,
      submittedBy: searchParams.get('submittedBy') || undefined,
      keyword: searchParams.get('keyword') || undefined,
    };

    // 处理日期范围
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      filter.dateRange = [new Date(startDate), new Date(endDate)];
    }

    const result = await InboundService.getAll(filter, pagination);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取入库单列表失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取入库单列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const data: CreateInboundForm = await request.json();
    
    // 数据验证
    if (!data.supplierId || !data.title || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段或入库明细' },
        { status: 400 }
      );
    }

    // 验证明细数据
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!item.materialId || item.quantity <= 0 || item.unitPrice < 0) {
        return NextResponse.json(
          { success: false, error: `第${i + 1}行明细数据有误` },
          { status: 400 }
        );
      }
    }

    const inboundOrder = await InboundService.create(data, session.user.id);
    
    return NextResponse.json({
      success: true,
      data: inboundOrder,
      message: '入库单创建成功'
    });
  } catch (error) {
    console.error('创建入库单失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '创建入库单失败' },
      { status: 500 }
    );
  }
}
