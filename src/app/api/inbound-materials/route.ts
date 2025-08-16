import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { InboundMaterial } from '@/models/InboundMaterial';
import {
  getOperatorFromRequest,
  validateSupplierId,
  validateRequiredFields,
  calculateTotalValue,
  sanitizeString
} from '@/utils/validation';


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
    const requiredFields = ['orderNumber', 'materialName', 'manufacturer', 'specification', 'color'];
    const missingFields = validateRequiredFields(body, requiredFields);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `缺少必填字段: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 验证数值字段
    const stockNumber = Number(currentStock);
    const priceNumber = Number(unitPrice);

    if (isNaN(stockNumber) || stockNumber < 0) {
      return NextResponse.json(
        { success: false, error: '库存数量必须是大于等于0的数字' },
        { status: 400 }
      );
    }

    if (isNaN(priceNumber) || priceNumber <= 0) {
      return NextResponse.json(
        { success: false, error: '单价必须是大于0的数字' },
        { status: 400 }
      );
    }

    // 连接数据库
    await connectToDatabase();

    // 检查入库单号是否重复
    const normalizedOrderNumber = orderNumber.trim().toUpperCase();
    const existingMaterial = await InboundMaterial.findOne({ 
      orderNumber: normalizedOrderNumber
    });

    if (existingMaterial) {
      return NextResponse.json(
        { success: false, error: '入库单号已存在' },
        { status: 400 }
      );
    }

    // 获取操作员信息
    const operator = getOperatorFromRequest(request);
    
    // 处理供应商ID
    const validSupplierId = validateSupplierId(supplierId);
    
    // 计算总价值
    const totalValue = calculateTotalValue(stockNumber, priceNumber);

    // 创建新的入库材料记录
    const materialData = {
      orderNumber: normalizedOrderNumber,
      materialName: materialName.trim(),
      manufacturer: manufacturer.trim(),
      specification: specification.trim(),
      color: color.trim(),
      pantoneColor: sanitizeString(pantoneColor),
      usedComponent: sanitizeString(usedComponent),
      customer: sanitizeString(customer),
      season: sanitizeString(season),
      currentStock: stockNumber,
      unitPrice: priceNumber,
      totalValue: totalValue,
      unit: sanitizeString(unit) || '件',
      description: sanitizeString(description),
      remarks: sanitizeString(remarks),
      supplierId: validSupplierId,
      supplierName: sanitizeString(supplierName),
      batchNumber: sanitizeString(batchNumber),
      manufactureDate: manufactureDate ? new Date(manufactureDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: 'pending' as const,
      operator: operator
    };

    const newMaterial = new InboundMaterial(materialData);
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