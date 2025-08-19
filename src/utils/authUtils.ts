import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/services/auth';

// 权限验证结果接口
export interface AuthResult {
  success: boolean;
  user?: {
    _id: any;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'operator';
    isActive: boolean;
    lastLoginAt?: Date;
  };
  error?: string;
}

// 权限验证配置
export interface PermissionConfig {
  allowedRoles: string[];
  requireAuth?: boolean;
  customErrorMessage?: string;
}

// 统一的权限验证函数
export async function validatePermission(
  request: NextRequest, 
  config: PermissionConfig
): Promise<{ valid: boolean; response?: NextResponse; user?: AuthResult['user'] }> {
  try {
    // 如果不需要认证，直接返回成功
    if (config.requireAuth === false) {
      return { valid: true };
    }

    // 验证身份
    const authResult = await verifyAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return {
        valid: false,
        response: NextResponse.json(
          { success: false, error: '未授权访问' },
          { status: 401 }
        )
      };
    }

    // 检查用户权限
    if (config.allowedRoles && config.allowedRoles.length > 0) {
      if (!config.allowedRoles.includes(authResult.user.role)) {
        return {
          valid: false,
          response: NextResponse.json(
            { 
              success: false, 
              error: config.customErrorMessage || '权限不足' 
            },
            { status: 403 }
          )
        };
      }
    }

    return { valid: true, user: authResult.user };
  } catch (error) {
    console.error('权限验证失败:', error);
    return {
      valid: false,
      response: NextResponse.json(
        { success: false, error: '认证服务异常' },
        { status: 500 }
      )
    };
  }
}

// 预定义的权限配置
export const PermissionConfigs = {
  // 管理员专用
  ADMIN_ONLY: {
    allowedRoles: ['admin'],
    customErrorMessage: '只有管理员可以执行此操作'
  },
  
  // 管理员和管理者
  ADMIN_MANAGER: {
    allowedRoles: ['admin', 'manager'],
    customErrorMessage: '权限不足，只有管理员和管理者可以执行此操作'
  },
  
  // 所有认证用户
  ALL_AUTHENTICATED: {
    allowedRoles: ['admin', 'manager', 'operator']
  },
  
  // 删除操作权限（管理员和管理者）
  DELETE_PERMISSION: {
    allowedRoles: ['admin', 'manager'],
    customErrorMessage: '权限不足，无法删除记录'
  },
  
  // 审核权限（仅管理员）
  AUDIT_PERMISSION: {
    allowedRoles: ['admin'],
    customErrorMessage: '只有管理员可以进行审核操作'
  }
};

// 业务逻辑验证函数
export async function validateBusinessLogic(
  item: any,
  operation: 'delete' | 'update' | 'create',
  customValidators?: ((item: any) => { valid: boolean; error?: string })[]
): Promise<{ valid: boolean; error?: string }> {
  try {
    // 删除操作的业务逻辑验证
    if (operation === 'delete') {
      // 检查是否可以安全删除
      if (item.status === 'active' && item.currentStock > 0) {
        return {
          valid: false,
          error: '该记录仍有活动状态或库存，无法删除。请先调整状态或库存。'
        };
      }
    }

    // 执行自定义验证器
    if (customValidators && customValidators.length > 0) {
      for (const validator of customValidators) {
        const result = validator(item);
        if (!result.valid) {
          return result;
        }
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('业务逻辑验证失败:', error);
    return { valid: false, error: '验证过程中发生错误' };
  }
}

// 统一的错误响应处理
export function createErrorResponse(
  error: any,
  operation: string,
  status: number = 500
): NextResponse {
  console.error(`${operation}失败:`, error);
  
  // 处理认证相关错误
  if (error instanceof Error && error.message.includes('认证')) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
  
  // 处理权限相关错误
  if (error instanceof Error && error.message.includes('权限')) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 403 }
    );
  }
  
  // 处理业务逻辑错误
  if (error instanceof Error && status === 400) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
  
  // 通用错误响应
  return NextResponse.json(
    { success: false, error: error instanceof Error ? error.message : `${operation}失败` },
    { status }
  );
}

// 操作日志记录（可选）
export function logOperation(
  operation: string,
  user: AuthResult['user'],
  resourceId: string,
  resourceType: string,
  success: boolean,
  error?: string
) {
  const logData = {
    timestamp: new Date().toISOString(),
    operation,
    user: {
      id: user?._id,
      username: user?.username,
      role: user?.role
    },
    resource: {
      id: resourceId,
      type: resourceType
    },
    success,
    error
  };
  
  console.log('操作日志:', JSON.stringify(logData, null, 2));
  // 这里可以扩展为写入数据库或发送到日志系统
}