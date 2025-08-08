import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { InboundMaterial } from '@/models/InboundMaterial';
import jwt from 'jsonwebtoken';

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

// PUT - 审核入库材料
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证身份
    const authResult = await verifyToken(request);
    console.error('审核入库材料:', authResult);
    // 检查用户权限（只有管理员可以审核）
    if (authResult.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '权限不足，只有管理员可以审核材料' },
        { status: 403 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { action, remarks } = body;

    // 验证必填参数
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '审核操作无效，必须是 approve 或 reject' },
        { status: 400 }
      );
    }

    // 连接数据库
    await connectToDatabase();

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少材料ID' },
        { status: 400 }
      );
    }

    // 查找要审核的材料
    const material = await InboundMaterial.findById(id);
    if (!material) {
      return NextResponse.json(
        { success: false, error: '未找到该材料记录' },
        { status: 404 }
      );
    }

    // 检查材料当前状态是否可以审核
    if (material.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: '该材料当前状态不是待审核，无法审核' },
        { status: 400 }
      );
    }

    // 确定新状态
    let newStatus: string;
    let message: string;

    if (action === 'approve') {
      newStatus = 'approved';
      message = '审核通过';
    } else {
      newStatus = 'inactive';
      message = '审核拒绝';
    }

    // 准备审核历史记录
    const auditRecord = {
      action,
      status: newStatus,
      auditorId: authResult.id,
      auditorName: authResult.username,
      remarks: remarks?.trim() || '',
      auditDate: new Date()
    };

    // 更新材料状态和审核历史
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
      $push: { auditHistory: auditRecord }
    };

    // 如果审核通过，材料变为已入库状态
    if (action === 'approve') {
      updateData.status = 'active';
    }

    const updatedMaterial = await InboundMaterial.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    return NextResponse.json({
      success: true,
      data: updatedMaterial,
      message: `材料 "${material.materialName}" 已${message}`,
      auditInfo: {
        action,
        auditor: auditRecord.auditorName,
        date: auditRecord.auditDate,
        remarks: auditRecord.remarks
      }
    });

  } catch (error) {
    console.error('审核入库材料失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// GET - 获取材料审核历史
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证身份
    const authResult = await verifyToken(request);
    console.error('获取审核历史:', authResult);
    // 连接数据库
    await connectToDatabase();

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少材料ID' },
        { status: 400 }
      );
    }

    // 查询材料及其审核历史
    const material = await InboundMaterial.findById(id).select('materialName auditHistory').lean();
    
    if (!material) {
      return NextResponse.json(
        { success: false, error: '未找到该材料记录' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        materialId: material._id,
        materialName: material.materialName,
        auditHistory: material.auditHistory || []
      }
    });

  } catch (error) {
    console.error('获取审核历史失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}