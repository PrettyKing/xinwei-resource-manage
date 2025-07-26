'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Material, MaterialCategory, CreateMaterialForm } from '@/types/business';
import { 
  CloseIcon,
  MaterialsIcon,
  SaveIcon,
  LoadingIcon
} from '@/components/icons';
import { ButtonLoading } from '@/components/Loading';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  material?: Material | null; // 编辑时传入材料数据
  mode: 'create' | 'edit';
}

interface FormData extends CreateMaterialForm {
  // 扩展表单数据类型
}

interface FormErrors {
  [key: string]: string;
}

export default function MaterialModal({ isOpen, onClose, onSuccess, material, mode }: MaterialModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    categoryId: '',
    specification: '',
    unit: '',
    description: '',
    minStock: 0,
    maxStock: 100,
    price: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 获取材料分类
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/categories', {
        headers
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCategories(result.data || []);
        }
      }
    } catch (error) {
      console.error('获取分类失败:', error);
      // 如果没有分类API，创建默认分类
      setCategories([
        { id: '507f1f77bcf86cd799439011', name: '电子元件', code: 'ELEC', level: 1, path: '507f1f77bcf86cd799439011' },
        { id: '507f1f77bcf86cd799439012', name: '机械零件', code: 'MECH', level: 1, path: '507f1f77bcf86cd799439012' },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      
      if (mode === 'edit' && material) {
        setFormData({
          name: material.name,
          code: material.code,
          categoryId: material.categoryId,
          specification: material.specification,
          unit: material.unit,
          description: material.description || '',
          minStock: material.minStock,
          maxStock: material.maxStock,
          price: material.price,
        });
      } else {
        // 创建模式，重置表单
        setFormData({
          name: '',
          code: '',
          categoryId: '',
          specification: '',
          unit: '',
          description: '',
          minStock: 0,
          maxStock: 100,
          price: 0,
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, material]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '材料名称不能为空';
    }

    if (!formData.code.trim()) {
      newErrors.code = '材料编码不能为空';
    } else if (!/^[A-Z0-9-_]+$/.test(formData.code)) {
      newErrors.code = '材料编码只能包含大写字母、数字、横线和下划线';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '请选择材料分类';
    }

    if (!formData.specification.trim()) {
      newErrors.specification = '材料规格不能为空';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = '计量单位不能为空';
    }

    if (formData.minStock < 0) {
      newErrors.minStock = '最小库存不能为负数';
    }

    if (formData.maxStock < 0) {
      newErrors.maxStock = '最大库存不能为负数';
    }

    if (formData.maxStock <= formData.minStock) {
      newErrors.maxStock = '最大库存必须大于最小库存';
    }

    if (formData.price < 0) {
      newErrors.price = '价格不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = mode === 'edit' ? `/api/materials/${material?.id}` : '/api/materials';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
        // TODO: 显示成功提示
        alert(mode === 'edit' ? '材料更新成功' : '材料创建成功');
      } else {
        throw new Error(result.error || '操作失败');
      }
    } catch (error) {
      console.error('保存材料失败:', error);
      alert(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单字段变化
  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MaterialsIcon size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'edit' ? '编辑材料' : '新增材料'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 材料名称 */}
            <div className="form-group">
              <label className="form-label">
                材料名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                placeholder="请输入材料名称"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {/* 材料编码 */}
            <div className="form-group">
              <label className="form-label">
                材料编码 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.code ? 'border-red-300' : ''}`}
                placeholder="请输入材料编码"
                value={formData.code}
                onChange={(e) => handleFieldChange('code', e.target.value.toUpperCase())}
              />
              {errors.code && <div className="form-error">{errors.code}</div>}
              <div className="form-help">只能包含大写字母、数字、横线和下划线</div>
            </div>

            {/* 材料分类 */}
            <div className="form-group">
              <label className="form-label">
                材料分类 <span className="text-red-500">*</span>
              </label>
              <select
                className={`input-field ${errors.categoryId ? 'border-red-300' : ''}`}
                value={formData.categoryId}
                onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                disabled={loadingCategories}
              >
                <option value="">请选择分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <div className="form-error">{errors.categoryId}</div>}
            </div>

            {/* 计量单位 */}
            <div className="form-group">
              <label className="form-label">
                计量单位 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.unit ? 'border-red-300' : ''}`}
                placeholder="如：个、台、米、公斤等"
                value={formData.unit}
                onChange={(e) => handleFieldChange('unit', e.target.value)}
              />
              {errors.unit && <div className="form-error">{errors.unit}</div>}
            </div>
          </div>

          {/* 材料规格 */}
          <div className="form-group">
            <label className="form-label">
              材料规格 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`input-field ${errors.specification ? 'border-red-300' : ''}`}
              placeholder="请输入详细规格信息"
              value={formData.specification}
              onChange={(e) => handleFieldChange('specification', e.target.value)}
            />
            {errors.specification && <div className="form-error">{errors.specification}</div>}
          </div>

          {/* 材料描述 */}
          <div className="form-group">
            <label className="form-label">材料描述</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="请输入材料描述（可选）"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 最小库存 */}
            <div className="form-group">
              <label className="form-label">
                最小库存 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                className={`input-field ${errors.minStock ? 'border-red-300' : ''}`}
                placeholder="0"
                value={formData.minStock}
                onChange={(e) => handleFieldChange('minStock', parseInt(e.target.value) || 0)}
              />
              {errors.minStock && <div className="form-error">{errors.minStock}</div>}
            </div>

            {/* 最大库存 */}
            <div className="form-group">
              <label className="form-label">
                最大库存 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                className={`input-field ${errors.maxStock ? 'border-red-300' : ''}`}
                placeholder="100"
                value={formData.maxStock}
                onChange={(e) => handleFieldChange('maxStock', parseInt(e.target.value) || 0)}
              />
              {errors.maxStock && <div className="form-error">{errors.maxStock}</div>}
            </div>

            {/* 单价 */}
            <div className="form-group">
              <label className="form-label">
                单价（元） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`input-field ${errors.price ? 'border-red-300' : ''}`}
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
              />
              {errors.price && <div className="form-error">{errors.price}</div>}
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              取消
            </button>
            <ButtonLoading
              type="submit"
              loading={loading}
              loadingText={mode === 'edit' ? '保存中...' : '创建中...'}
              className="btn-primary"
            >
              <SaveIcon size={16} className="mr-2" />
              {mode === 'edit' ? '保存修改' : '创建材料'}
            </ButtonLoading>
          </div>
        </form>
      </div>
    </div>
  );
}
