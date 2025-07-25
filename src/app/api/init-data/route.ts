import { NextRequest, NextResponse } from 'next/server';
import { Material, MaterialCategory, Supplier } from '@/models';
import { connectDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // 创建测试分类
    const categories = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: '电子元件',
        code: 'ELEC',
        description: '各种电子元器件',
        level: 1,
        path: '507f1f77bcf86cd799439011'
      },
      {
        _id: '507f1f77bcf86cd799439012',
        name: '机械零件',
        code: 'MECH',
        description: '机械加工零件',
        level: 1,
        path: '507f1f77bcf86cd799439012'
      }
    ];

    await MaterialCategory.deleteMany({});
    await MaterialCategory.insertMany(categories);

    // 创建测试供应商
    const suppliers = [
      {
        _id: '507f1f77bcf86cd799439021',
        name: '华强电子',
        code: 'HQ001',
        contactPerson: '张三',
        phone: '13800138000',
        email: 'zhangsan@huaqiang.com',
        address: '深圳市福田区华强北',
        status: 'active'
      },
      {
        _id: '507f1f77bcf86cd799439022',
        name: '精密制造',
        code: 'JM001',
        contactPerson: '李四',
        phone: '13800138001',
        email: 'lisi@jingmi.com',
        address: '苏州市工业园区',
        status: 'active'
      }
    ];

    await Supplier.deleteMany({});
    await Supplier.insertMany(suppliers);

    // 创建测试材料
    const materials = [
      {
        name: '电阻器-10K欧',
        code: 'R10K001',
        categoryId: '507f1f77bcf86cd799439011',
        specification: '1/4W ±5% 金属膜电阻',
        unit: '个',
        description: '通用型电阻器',
        minStock: 100,
        maxStock: 1000,
        currentStock: 150,
        price: 0.15,
        status: 'active'
      },
      {
        name: '电容器-100uF',
        code: 'C100U001',
        categoryId: '507f1f77bcf86cd799439011',
        specification: '16V 铝电解电容',
        unit: '个',
        description: '小型铝电解电容器',
        minStock: 50,
        maxStock: 500,
        currentStock: 25, // 库存不足
        price: 0.25,
        status: 'active'
      },
      {
        name: '螺丝-M3x10',
        code: 'SC-M3-10',
        categoryId: '507f1f77bcf86cd799439012',
        specification: 'M3×10mm 304不锈钢',
        unit: '个',
        description: '精密机械用螺丝',
        minStock: 200,
        maxStock: 2000,
        currentStock: 800,
        price: 0.05,
        status: 'active'
      },
      {
        name: '轴承-6800',
        code: 'BR-6800',
        categoryId: '507f1f77bcf86cd799439012',
        specification: '6800-2RS 深沟球轴承',
        unit: '个',
        description: '高精度密封轴承',
        minStock: 10,
        maxStock: 100,
        currentStock: 5, // 库存不足
        price: 12.50,
        status: 'active'
      }
    ];

    await Material.deleteMany({});
    await Material.insertMany(materials);

    return NextResponse.json({
      success: true,
      message: '测试数据初始化成功',
      data: {
        categories: categories.length,
        suppliers: suppliers.length,
        materials: materials.length
      }
    });
  } catch (error) {
    console.error('初始化测试数据失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '初始化失败' },
      { status: 500 }
    );
  }
}
