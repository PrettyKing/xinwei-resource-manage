import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRES_IN = '7d';

// 密码加密
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// 密码验证
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// 生成 JWT Token
export const generateToken = (payload: { id: string; username: string; role: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// 验证 JWT Token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// 从请求中提取 token
export const extractTokenFromRequest = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 也可以从 cookie 中获取
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
};

// 验证用户身份中间件
export const authenticateUser = async (request: NextRequest) => {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    throw new Error('Authentication token required');
  }
  
  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
};

// 角色权限检查
export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

// 角色层级定义
export const roleHierarchy = {
  admin: ['admin', 'manager', 'operator'],
  manager: ['manager', 'operator'],
  operator: ['operator'],
};

// 检查角色权限（支持层级）
export const checkRolePermission = (userRole: string, requiredRole: string): boolean => {
  const userPermissions = roleHierarchy[userRole as keyof typeof roleHierarchy] || [];
  return userPermissions.includes(requiredRole);
};
