import { NextRequest, NextResponse } from 'next/server';
import { InboundService } from '@/services/business';
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

    const inboundOrder = await InboundService.getById(params.id);
    
    if (!inboundOrder) {
      return NextResponse.json(
        { success: false, error: '入库单不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: inboundOrder
    });
  } catch (error) {
    console.error('获取入库单详情失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取入库单详情失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = verifyToken(request);

    await InboundService.delete(params.id);
    
    return NextResponse.json({
      success: true,
      message: '入库单删除成功'
    });
  } catch (error) {
    console.error('删除入库单失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '删除入库单失败' },
      { status: 500 }
    );
  }
}
