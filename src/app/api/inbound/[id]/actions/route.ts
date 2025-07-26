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

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = verifyToken(request);
    const { action, ...data } = await request.json();

    let result;
    let message = '';

    switch (action) {
      case 'submit': {
        // 提交入库单
        result = await InboundService.submit(params.id, user.id);
        message = '入库单提交成功';
        break;
      }

      case 'approve': {
        // 审批入库单 - 需要管理员权限
        if (user.role !== 'admin' && user.role !== 'manager') {
          return NextResponse.json(
            { success: false, error: '权限不足，只有管理员可以审批入库单' },
            { status: 403 }
          );
        }
        result = await InboundService.approve(params.id, user.id);
        message = '入库单审批通过';
        break;
      }

      case 'reject': {
        // 拒绝入库单 - 需要管理员权限
        if (user.role !== 'admin' && user.role !== 'manager') {
          return NextResponse.json(
            { success: false, error: '权限不足，只有管理员可以拒绝入库单' },
            { status: 403 }
          );
        }
        
        const { reason } = data;
        if (!reason || !reason.trim()) {
          return NextResponse.json(
            { success: false, error: '请填写拒绝原因' },
            { status: 400 }
          );
        }
        
        result = await InboundService.reject(params.id, reason, user.id);
        message = '入库单已拒绝';
        break;
      }

      case 'complete': {
        // 完成入库 - 需要操作员及以上权限
        const { actualQuantities } = data;
        
        if (!actualQuantities || typeof actualQuantities !== 'object') {
          return NextResponse.json(
            { success: false, error: '请填写实际入库数量' },
            { status: 400 }
          );
        }
        
        result = await InboundService.complete(params.id, actualQuantities, user.id);
        message = '入库完成';
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: '不支持的操作类型' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message
    });

  } catch (error) {
    console.error('入库单操作失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '操作失败' },
      { status: 500 }
    );
  }
}
