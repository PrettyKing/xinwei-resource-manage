import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { InboundMaterial } from '@/models/InboundMaterial';
import { verifyAuth } from '@/services/auth';



// GET - 获取单个入库材料详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证身份
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
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

    // 查询材料详情
    const material = await InboundMaterial.findById(id).lean();
    
    if (!material) {
      return NextResponse.json(
        { success: false, error: '未找到该材料记录' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: material
    });

  } catch (error) {
    console.error('获取材料详情失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// PUT - 更新入库材料
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 解析请求体
    const body = await request.json();
    const {
      materialName,
      manufacturer,
      specification,
      color,
      pantoneColor,
      usedComponent,
      customer,
      season,
      currentStock,
      unitPrice,
      unit,
      description,
      remarks,
      supplierId,
      supplierName,
      status,
      batchNumber,
      manufactureDate,
      expiryDate
    } = body;

    // 连接数据库
    await connectToDatabase();

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少材料ID' },
        { status: 400 }
      );
    }

    // 查找现有材料
    const existingMaterial = await InboundMaterial.findById(id);
    if (!existingMaterial) {
      return NextResponse.json(
        { success: false, error: '未找到该材料记录' },
        { status: 404 }
      );
    }

    // 构建更新数据
    const updateData: any = {};
    
    if (materialName !== undefined) updateData.materialName = materialName.trim();
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer.trim();
    if (specification !== undefined) updateData.specification = specification.trim();
    if (color !== undefined) updateData.color = color.trim();
    if (pantoneColor !== undefined) updateData.pantoneColor = pantoneColor?.trim();
    if (usedComponent !== undefined) updateData.usedComponent = usedComponent?.trim();
    if (customer !== undefined) updateData.customer = customer?.trim();
    if (season !== undefined) updateData.season = season?.trim();
    
    if (currentStock !== undefined) {
      if (currentStock < 0) {
        return NextResponse.json(
          { success: false, error: '库存数量不能小于0' },
          { status: 400 }
        );
      }
      updateData.currentStock = Number(currentStock);
    }
    
    if (unitPrice !== undefined) {
      if (unitPrice <= 0) {
        return NextResponse.json(
          { success: false, error: '单价必须大于0' },
          { status: 400 }
        );
      }
      updateData.unitPrice = Number(unitPrice);
    }
    
    if (unit !== undefined) updateData.unit = unit.trim() || '件';
    if (description !== undefined) updateData.description = description?.trim();
    if (remarks !== undefined) updateData.remarks = remarks?.trim();
    if (supplierId !== undefined) updateData.supplierId = supplierId;
    if (supplierName !== undefined) updateData.supplierName = supplierName?.trim();
    if (status !== undefined) updateData.status = status;
    if (batchNumber !== undefined) updateData.batchNumber = batchNumber?.trim();
    if (manufactureDate !== undefined) {
      updateData.manufactureDate = manufactureDate ? new Date(manufactureDate) : null;
    }
    if (expiryDate !== undefined) {
      updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    // 验证必填字段（如果提供了的话）
    if (materialName !== undefined && !materialName.trim()) {
      return NextResponse.json(
        { success: false, error: '材料名称不能为空' },
        { status: 400 }
      );
    }
    if (manufacturer !== undefined && !manufacturer.trim()) {
      return NextResponse.json(
        { success: false, error: '材料厂商不能为空' },
        { status: 400 }
      );
    }
    if (specification !== undefined && !specification.trim()) {
      return NextResponse.json(
        { success: false, error: '规格不能为空' },
        { status: 400 }
      );
    }
    if (color !== undefined && !color.trim()) {
      return NextResponse.json(
        { success: false, error: '颜色不能为空' },
        { status: 400 }
      );
    }

    // 如果没有任何更新数据
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: '没有提供任何更新数据' },
        { status: 400 }
      );
    }

    // 更新材料，totalValue会通过pre('save')中间件自动计算
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
      message: '入库材料更新成功'
    });

  } catch (error) {
    console.error('更新入库材料失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// DELETE - 删除入库材料
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证身份
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
    }

    // 检查用户权限（只有管理员和管理者可以删除）
    if (!['admin', 'manager'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, error: '权限不足，无法删除材料' },
        { status: 403 }
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

    // 查找要删除的材料
    const material = await InboundMaterial.findById(id);
    if (!material) {
      return NextResponse.json(
        { success: false, error: '未找到该材料记录' },
        { status: 404 }
      );
    }

    // 检查材料状态，如果是已入库状态可能需要特殊处理
    if (material.status === 'active' && material.currentStock > 0) {
      return NextResponse.json(
        { success: false, error: '该材料仍有库存，无法删除。请先调整库存或修改状态。' },
        { status: 400 }
      );
    }

    // 删除材料
    await InboundMaterial.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `入库材料 "${material.materialName}" 已成功删除`
    });

  } catch (error) {
    console.error('删除入库材料失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}