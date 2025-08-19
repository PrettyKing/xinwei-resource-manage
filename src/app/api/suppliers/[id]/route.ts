import { NextRequest, NextResponse } from 'next/server';
import { SupplierService } from '@/services/business';
import { CreateSupplierForm } from '@/types/business';
import jwt from 'jsonwebtoken';
import { validatePermission, validateBusinessLogic, createErrorResponse, logOperation, PermissionConfigs } from '@/utils/authUtils';

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
  const { id } = params;
  
  try {
    // 参数验证
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少供应商ID' },
        { status: 400 }
      );
    }

    // 权限验证
    const permissionResult = await validatePermission(request, PermissionConfigs.DELETE_PERMISSION);
    if (!permissionResult.valid) {
      return permissionResult.response!;
    }

    // 查找要删除的供应商
    const supplier = await SupplierService.getById(id);
    if (!supplier) {
      logOperation('DELETE', permissionResult.user, id, 'Supplier', false, '供应商记录不存在');
      return NextResponse.json(
        { success: false, error: '未找到该供应商记录' },
        { status: 404 }
      );
    }

    // 业务逻辑验证（检查是否有关联数据）
    const businessValidation = await validateBusinessLogic(supplier, 'delete', [
      // 检查是否有关联的入库记录
      (item) => {
        // 这里可以添加检查逻辑，比如查询是否有关联的入库记录
        if (item.status === 'active') {
          // 这里可以添加更复杂的检查逻辑
        }
        return { valid: true };
      }
    ]);

    if (!businessValidation.valid) {
      logOperation('DELETE', permissionResult.user, id, 'Supplier', false, businessValidation.error);
      return NextResponse.json(
        { success: false, error: businessValidation.error },
        { status: 400 }
      );
    }

    // 执行删除
    await SupplierService.delete(id);
    
    // 记录成功操作
    logOperation('DELETE', permissionResult.user, id, 'Supplier', true);

    return NextResponse.json({
      success: true,
      message: `供应商 "${supplier.name}" 删除成功`
    });
  } catch (error) {
    // 记录失败操作
    logOperation('DELETE', undefined, id, 'Supplier', false, error instanceof Error ? error.message : '未知错误');
    return createErrorResponse(error, '删除供应商');
  }
}
