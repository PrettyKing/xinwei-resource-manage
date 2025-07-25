import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ message: '数据库连接成功', status: 'ok' });
  } catch (error) {
    console.error('数据库连接失败:', error);
    return NextResponse.json(
      { message: '数据库连接失败', error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
