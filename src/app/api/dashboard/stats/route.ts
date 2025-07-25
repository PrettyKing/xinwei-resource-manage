import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '@/services/business';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const stats = await DashboardService.getStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取仪表盘统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取统计数据失败' },
      { status: 500 }
    );
  }
}
