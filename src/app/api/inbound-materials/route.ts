import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { InboundMaterial } from '@/models/InboundMaterial';
import { verifyAuth } from '@/services/auth';

// GET - 获取入库材料列表
export async function GET(request: NextRequest) {
  try {
    // 连接数据库
    await connectToDatabase();

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');
    const customer = searchParams.get('customer');
    const season = searchParams.get('season');
    const manufacturer = searchParams.get('manufacturer');

    // 构建查询条件
    const query: any = {};

    if (keyword) {
      query.$or = [
        { orderNumber: { $regex: keyword, $options: 'i' } },
        { materialName: { $regex: keyword, $options: 'i' } },
        { manufacturer: { $regex: keyword, $options: 'i' } },
        { color: { $regex: keyword, $options: 'i' } },
        { pantoneColor: { $regex: keyword, $options: 'i' } },
        { customer: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (customer) query.customer = { $regex: customer, $options: 'i' };
    if (season) query.season = season;
    if (manufacturer) query.manufacturer = { $regex: manufacturer, $options: 'i' };

    // 计算分页
    const skip = (page - 1) * pageSize;

    // 查询数据
    const [materials, total] = await Promise.all([
      InboundMaterial.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      InboundMaterial.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: materials,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });

  } catch (error) {
    console.error('获取入库材料列表失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// POST - 创建新的入库材料记录
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const {
      orderNumber,
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
      batchNumber,
      manufactureDate,
      expiryDate
    } = body;

    // 验证必填字段
    if (!orderNumber || !materialName || !manufacturer || !specification || !color) {
      return NextResponse.json(
        { success: false, error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    if (!currentStock || currentStock < 0) {
      return NextResponse.json(
        { success: false, error: '库存数量必须大于0' },
        { status: 400 }
      );
    }

    if (!unitPrice || unitPrice <= 0) {
      return NextResponse.json(
        { success: false, error: '单价必须大于0' },
        { status: 400 }
      );
    }

    // 连接数据库
    await connectToDatabase();

    // 检查入库单号是否重复
    const existingMaterial = await InboundMaterial.findOne({ 
      orderNumber: orderNumber.trim().toUpperCase() 
    });

    if (existingMaterial) {
      return NextResponse.json(
        { success: false, error: '入库单号已存在' },
        { status: 400 }
      );
    }

    // 创建新的入库材料记录
    const newMaterial = new InboundMaterial({
      orderNumber: orderNumber.trim().toUpperCase(),
      materialName: materialName.trim(),
      manufacturer: manufacturer.trim(),
      specification: specification.trim(),
      color: color.trim(),
      pantoneColor: pantoneColor?.trim(),
      usedComponent: usedComponent?.trim(),
      customer: customer?.trim(),
      season: season?.trim(),
      currentStock: Number(currentStock),
      unitPrice: Number(unitPrice),
      unit: unit?.trim() || '件',
      description: description?.trim(),
      remarks: remarks?.trim(),
      supplierId,
      supplierName: supplierName?.trim(),
      batchNumber: batchNumber?.trim(),
      manufactureDate: manufactureDate ? new Date(manufactureDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: 'pending'
    });

    await newMaterial.save();

    return NextResponse.json({
      success: true,
      data: newMaterial,
      message: '入库材料创建成功'
    });

  } catch (error) {
    console.error('创建入库材料失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}