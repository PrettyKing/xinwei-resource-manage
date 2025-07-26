import { NextRequest, NextResponse } from 'next/server';
import { Material } from '@/models';
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
    
    const materials = await Material.find({ status: 'active' })
      .select('name code unit price')
      .sort({ name: 1 })
      .lean();
    
    const options = materials.map(material => ({
      id: material._id.toString(),
      name: material.name,
      code: material.code,
      unit: material.unit,
      price: material.price
    }));
    
    return NextResponse.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('获取材料选项失败:', error);
    
    if (error instanceof Error && error.message.includes('认证')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取材料选项失败' },
      { status: 500 }
    );
  }
}
