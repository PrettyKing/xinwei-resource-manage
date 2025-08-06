'use client';

import { useState, useEffect } from 'react';
import { InboundMaterial, CreateInboundMaterialForm, UpdateInboundMaterialForm } from '@/types/business';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XIcon } from '@/components/icons/index';

interface InboundMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateInboundMaterialForm | UpdateInboundMaterialForm) => Promise<void>;
  material?: InboundMaterial | null;
  mode: 'create' | 'edit';
}

const seasonOptions = ['春季', '夏季', '秋季', '冬季', '全年'];
const unitOptions = ['件', '米', '平方米', '公斤', '吨', '升', '毫升', '个', '套', '卷'];

export function InboundMaterialModal({ 
  isOpen, 
  onClose, 
  onSave, 
  material, 
  mode 
}: InboundMaterialModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInboundMaterialForm>({
    orderNumber: '',
    materialName: '',
    manufacturer: '',
    specification: '',
    color: '',
    pantoneColor: '',
    usedComponent: '',
    customer: '',
    season: '',
    currentStock: 0,
    unitPrice: 0,
    unit: '件',
    description: '',
    remarks: '',
    supplierId: '',
    supplierName: '',
    batchNumber: '',
    manufactureDate: undefined,
    expiryDate: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && material) {
      setFormData({
        orderNumber: material.orderNumber,
        materialName: material.materialName,
        manufacturer: material.manufacturer,
        specification: material.specification,
        color: material.color,
        pantoneColor: material.pantoneColor || '',
        usedComponent: material.usedComponent || '',
        customer: material.customer || '',
        season: material.season || '',
        currentStock: material.currentStock,
        unitPrice: material.unitPrice,
        unit: material.unit,
        description: material.description || '',
        remarks: material.remarks || '',
        supplierId: material.supplierId?.toString() || '',
        supplierName: material.supplierName || '',
        batchNumber: material.batchNumber || '',
        manufactureDate: material.manufactureDate,
        expiryDate: material.expiryDate,
      });
    } else {
      // 重置表单
      setFormData({
        orderNumber: '',
        materialName: '',
        manufacturer: '',
        specification: '',
        color: '',
        pantoneColor: '',
        usedComponent: '',
        customer: '',
        season: '',
        currentStock: 0,
        unitPrice: 0,
        unit: '件',
        description: '',
        remarks: '',
        supplierId: '',
        supplierName: '',
        batchNumber: '',
        manufactureDate: undefined,
        expiryDate: undefined,
      });
    }
    setErrors({});
  }, [mode, material, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderNumber.trim()) {
      newErrors.orderNumber = '入库单号不能为空';
    }
    if (!formData.materialName.trim()) {
      newErrors.materialName = '材料名称不能为空';
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = '材料厂商不能为空';
    }
    if (!formData.specification.trim()) {
      newErrors.specification = '规格不能为空';
    }
    if (!formData.color.trim()) {
      newErrors.color = '颜色不能为空';
    }
    if (formData.currentStock <= 0) {
      newErrors.currentStock = '库存数量必须大于0';
    }
    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = '单价必须大于0';
    }
    if (!formData.unit.trim()) {
      newErrors.unit = '单位不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (mode === 'edit') {
        // 编辑模式，只提交修改过的字段
        const updateData: UpdateInboundMaterialForm = {};
        if (material) {
          if (formData.materialName !== material.materialName) updateData.materialName = formData.materialName;
          if (formData.manufacturer !== material.manufacturer) updateData.manufacturer = formData.manufacturer;
          if (formData.specification !== material.specification) updateData.specification = formData.specification;
          if (formData.color !== material.color) updateData.color = formData.color;
          if (formData.pantoneColor !== material.pantoneColor) updateData.pantoneColor = formData.pantoneColor;
          if (formData.usedComponent !== material.usedComponent) updateData.usedComponent = formData.usedComponent;
          if (formData.customer !== material.customer) updateData.customer = formData.customer;
          if (formData.season !== material.season) updateData.season = formData.season;
          if (formData.currentStock !== material.currentStock) updateData.currentStock = formData.currentStock;
          if (formData.unitPrice !== material.unitPrice) updateData.unitPrice = formData.unitPrice;
          if (formData.unit !== material.unit) updateData.unit = formData.unit;
          if (formData.description !== material.description) updateData.description = formData.description;
          if (formData.remarks !== material.remarks) updateData.remarks = formData.remarks;
          if (formData.supplierName !== material.supplierName) updateData.supplierName = formData.supplierName;
          if (formData.batchNumber !== material.batchNumber) updateData.batchNumber = formData.batchNumber;
        }
        await onSave(updateData);
      } else {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateInboundMaterialForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {mode === 'create' ? '新增入库材料' : '编辑入库材料'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8"
          >
            <XIcon size={16} />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  入库单号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                  disabled={mode === 'edit'}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.orderNumber ? 'border-red-500' : 'border-gray-300'
                  } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
                  placeholder="请输入入库单号"
                />
                {errors.orderNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.orderNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  材料名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.materialName}
                  onChange={(e) => handleInputChange('materialName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.materialName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入材料名称"
                />
                {errors.materialName && (
                  <p className="text-red-500 text-xs mt-1">{errors.materialName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  材料厂商 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.manufacturer ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入材料厂商"
                />
                {errors.manufacturer && (
                  <p className="text-red-500 text-xs mt-1">{errors.manufacturer}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  规格 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.specification}
                  onChange={(e) => handleInputChange('specification', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.specification ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入规格"
                />
                {errors.specification && (
                  <p className="text-red-500 text-xs mt-1">{errors.specification}</p>
                )}
              </div>
            </div>

            {/* 颜色信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  颜色 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.color ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入颜色"
                />
                {errors.color && (
                  <p className="text-red-500 text-xs mt-1">{errors.color}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  潘通色号
                </label>
                <input
                  type="text"
                  value={formData.pantoneColor}
                  onChange={(e) => handleInputChange('pantoneColor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入潘通色号"
                />
              </div>
            </div>

            {/* 使用信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  使用部件
                </label>
                <input
                  type="text"
                  value={formData.usedComponent}
                  onChange={(e) => handleInputChange('usedComponent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入使用部件"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  使用客户
                </label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => handleInputChange('customer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入使用客户"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  样品季节
                </label>
                <select
                  value={formData.season}
                  onChange={(e) => handleInputChange('season', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择季节</option>
                  {seasonOptions.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 库存和价格 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  库存 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.currentStock}
                  onChange={(e) => handleInputChange('currentStock', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentStock ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入库存数量"
                />
                {errors.currentStock && (
                  <p className="text-red-500 text-xs mt-1">{errors.currentStock}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  单价 (元) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.unitPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入单价"
                />
                {errors.unitPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  单位 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.unit ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {unitOptions.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
                )}
              </div>
            </div>

            {/* 总价值显示 */}
            {formData.currentStock > 0 && formData.unitPrice > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  总价值: ¥{(formData.currentStock * formData.unitPrice).toLocaleString()}
                </div>
              </div>
            )}

            {/* 供应商和批次信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  供应商名称
                </label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入供应商名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  批次号
                </label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入批次号"
                />
              </div>
            </div>

            {/* 日期信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生产日期
                </label>
                <input
                  type="date"
                  value={formData.manufactureDate ? formData.manufactureDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('manufactureDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  过期日期
                </label>
                <input
                  type="date"
                  value={formData.expiryDate ? formData.expiryDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 描述和备注 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入材料描述"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入备注信息"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? '保存中...' : (mode === 'create' ? '创建' : '更新')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}