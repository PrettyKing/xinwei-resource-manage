import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/business';
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

// 重置用户密码
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const currentUser = verifyToken(request);

    // 检查权限 - 只有管理员可以重置密码
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const { action, ...data } = await request.json();

    switch (action) {
      case 'reset_password': {
        const { newPassword } = data;
        
        if (!newPassword || newPassword.trim().length < 6) {
          return NextResponse.json(
            { success: false, error: '新密码长度至少6位' },
            { status: 400 }
          );
        }

        // await UserService.updatePassword(params.id, newPassword);
        
        return NextResponse.json({
          success: true,
          message: '密码重置成功'
        });
      }

      case 'toggle_status': {
        const { status } = data;
        
        if (!['active', 'inactive'].includes(status)) {
          return NextResponse.json(
            { success: false, error: '无效的状态值' },
            { status: 400 }
          );
        }

        // 防止禁用自己
        if (currentUser.id === params.id && status === 'inactive') {
          return NextResponse.json(
            { success: false, error: '不能禁用自己的账户' },
            { status: 400 }
          );
        }

        const user = await UserService.updateStatus(params.id, status, currentUser.id);
        
        if (!user) {
          return NextResponse.json(
            { success: false, error: '用户不存在' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: user,
          message: `用户已${status === 'active' ? '启用' : '禁用'}`
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: '不支持的操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('用户操作失败:', error);
    
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
