import { NextRequest, NextResponse } from 'next/server';
import { MaterialCategory } from '@/models';
import { connectDB } from '@/lib/db';
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
    await connectDB();

    const categories = await MaterialCategory.find()
      .sort({ level: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取材料分类失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取分类失败' },
      { status: 500 }
    );
  }
}
