import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/business';
import { CreateUserForm, UserFilter, PaginationParams } from '@/types/business';
import { User, IUser } from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';

// 验证 JWT Token
function verifyToken(request: NextRequest) {
  // 从Authorization header中提取token
  const authorization = request.headers.get('authorization');
  let token = null;
  
  if (authorization?.startsWith('Bearer ')) {
    token = authorization.substring(7);
  }
  
  // 如果没有Authorization header，尝试从Cookie中获取
  if (!token) {
    const cookieToken = request.cookies.get('auth-token')?.value;
    if (cookieToken) {
      token = cookieToken;
    }
  }
  
  if (!token) {
    throw new Error('缺少认证令牌');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded;
  } catch (error) {
    throw new Error('认证令牌已过期或无效');
  }
}

// 生成 JWT Token
function generateToken(payload: any) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
}

// 验证密码
async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

// 加密密码
async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

// 用户登录
export async function loginUser(credentials: { username: string; password: string }) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ username: credentials.username }).lean() as IUser | null;
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const isValidPassword = await verifyPassword(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new Error('账户已被禁用');
    }

    // 更新最后登录时间
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // 生成令牌
    const token = generateToken({
      userId: user._id,
      username: user.username,
      role: user.role,
      email: user.email
    });

    return {
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: new Date()
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '登录失败'
    };
  }
}

// 用户注册
export async function registerUser(userData: CreateUserForm) {
  try {
    await connectToDatabase();
    
    // 检查用户名是否存在
    const existingUser = await User.findOne({ username: userData.username });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await hashPassword(userData.password);

    // 创建用户
    const newUser = new User({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      isActive: true
    });
    await newUser.save();

    return {
      success: true,
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '注册失败'
    };
  }
}

// 获取当前用户信息
export async function getCurrentUser(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    await connectToDatabase();
    const user = await User.findById(decoded.userId).lean() as IUser | null;
    
    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLogin
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户信息失败'
    };
  }
}

// 更新用户信息
export async function updateUserProfile(request: NextRequest, updateData: Partial<CreateUserForm>) {
  try {
    const decoded = verifyToken(request);
    
    // 如果更新密码，需要加密
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId, 
      updateData, 
      { new: true }
    ).lean() as IUser | null;
    
    if (!updatedUser) {
      throw new Error('更新用户失败');
    }
    
    return {
      success: true,
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新用户信息失败'
    };
  }
}

// 修改密码
export async function changePassword(
  request: NextRequest, 
  passwords: { currentPassword: string; newPassword: string }
) {
  try {
    const decoded = verifyToken(request);
    await connectToDatabase();
    const user = await User.findById(decoded.userId).lean() as IUser | null;
    
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证当前密码
    const isValidPassword = await verifyPassword(passwords.currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('当前密码错误');
    }

    // 加密新密码
    const hashedNewPassword = await hashPassword(passwords.newPassword);

    // 更新密码
    await User.findByIdAndUpdate(decoded.userId, { password: hashedNewPassword });

    return {
      success: true,
      message: '密码修改成功'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '修改密码失败'
    };
  }
}

// 刷新令牌
export async function refreshToken(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    await connectToDatabase();
    const user = await User.findById(decoded.userId).lean() as IUser | null;
    
    if (!user || !user.isActive) {
      throw new Error('用户状态异常');
    }

    // 生成新令牌
    const newToken = generateToken({
      userId: user._id,
      username: user.username,
      role: user.role,
      email: user.email
    });

    return {
      success: true,
      data: { token: newToken }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '刷新令牌失败'
    };
  }
}

// 权限检查中间件
export function checkPermission(requiredRole: string[] | string) {
  return (request: NextRequest) => {
    try {
      const decoded = verifyToken(request);
      const userRole = decoded.role;
      
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      
      // 角色等级：admin > manager > operator
      const roleHierarchy = {
        'admin': 3,
        'manager': 2,
        'operator': 1
      };
      
      const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
      const requiredLevel = Math.min(...roles.map(role => 
        roleHierarchy[role as keyof typeof roleHierarchy] || 0
      ));
      
      if (userLevel < requiredLevel) {
        throw new Error('权限不足');
      }
      
      return decoded;
    } catch (error) {
      throw error;
    }
  };
}

// 创建受保护的API响应
export function createProtectedResponse(
  handler: (request: NextRequest, user: any) => Promise<any>,
  requiredRole?: string[] | string
) {
  return async (request: NextRequest) => {
    try {
      let user;
      
      if (requiredRole) {
        user = checkPermission(requiredRole)(request);
      } else {
        user = verifyToken(request);
      }
      
      const result = await handler(request, user);
      
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : '请求失败' 
        },
        { status: 401 }
      );
    }
  };
}

// 验证请求认证状态 - 返回用户信息
export async function verifyAuth(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    console.log('Token decoded successfully:', decoded);
    console.log('Token decoded successfully:', { userId: decoded.id, role: decoded.role });
    
    await connectToDatabase();
    const user = await User.findById(decoded.id).lean() as IUser | null;
    
    if (!user) {
      console.log('User not found for userId:', decoded.id);
      return {
        success: false,
        error: '用户不存在'
      };
    }

    console.log('User found:', user);

    if (!user.isActive) {
      console.log('User account is not active:', user.isActive);
      return {
        success: false,
        error: '账户已被禁用'
      };
    }

    return {
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLogin
      }
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '认证失败'
    };
  }
}

// 导出认证工具函数
export const AuthService = {
  verifyToken,
  generateToken,
  verifyPassword,
  hashPassword,
  loginUser,
  registerUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  refreshToken,
  checkPermission,
  createProtectedResponse,
  verifyAuth
};

export default AuthService;
