import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

/**
 * 从请求中提取操作员信息
 * 这是一个临时实现，实际项目中应该从认证 token 中获取用户信息
 */
export function getOperatorFromRequest(request: NextRequest) {
  // 从请求头中获取用户信息（如果有的话）
  const userId = request.headers.get('x-user-id');
  const userName = request.headers.get('x-user-name');

  if (userId && userName && mongoose.Types.ObjectId.isValid(userId)) {
    return {
      id: new mongoose.Types.ObjectId(userId),
      name: userName
    };
  }

  // 如果没有用户信息，返回默认操作员
  return {
    id: new mongoose.Types.ObjectId(),
    name: 'System User'
  };
}

/**
 * 验证并处理 supplierId
 */
export function validateSupplierId(supplierId?: string): mongoose.Types.ObjectId | undefined {
  if (!supplierId || !supplierId.trim()) {
    return undefined;
  }

  if (mongoose.Types.ObjectId.isValid(supplierId)) {
    return new mongoose.Types.ObjectId(supplierId);
  }

  return undefined;
}

/**
 * 验证必填字段
 */
export function validateRequiredFields(data: any, requiredFields: string[]): string[] {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

/**
 * 计算材料总价值
 */
export function calculateTotalValue(currentStock: number, unitPrice: number): number {
  return Number(currentStock) * Number(unitPrice);
}

/**
 * 清理和格式化字符串字段
 */
export function sanitizeString(value?: string): string | undefined {
  if (!value || typeof value !== 'string') {
    return undefined;
  }
  
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}