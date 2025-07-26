'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Supplier, CreateSupplierForm } from '@/types/business';
import { 
  CloseIcon,
  SuppliersIcon,
  SaveIcon,
  UserIcon,
  MailIcon,
  MapIcon
} from '@/components/icons';
import { ButtonLoading } from '@/components/Loading';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier?: Supplier | null; // 编辑时传入供应商数据
  mode: 'create' | 'edit';
}

interface FormData extends CreateSupplierForm {
  // 扩展表单数据类型
}

interface FormErrors {
  [key: string]: string;
}

export default function SupplierModal({ isOpen, onClose, onSuccess, supplier, mode }: SupplierModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && supplier) {
        setFormData({
          name: supplier.name,
          code: supplier.code,
          contactPerson: supplier.contactPerson,
          phone: supplier.phone,
          email: supplier.email || '',
          address: supplier.address,
          description: supplier.description || '',
        });
      } else {
        // 创建模式，重置表单
        setFormData({
          name: '',
          code: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, supplier]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '供应商名称不能为空';
    }

    if (!formData.code.trim()) {
      newErrors.code = '供应商编码不能为空';
    } else if (!/^[A-Z0-9-_]+$/.test(formData.code)) {
      newErrors.code = '供应商编码只能包含大写字母、数字、横线和下划线';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = '联系人不能为空';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '联系电话不能为空';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号码';
    }

    if (formData.email && formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '请输入正确的邮箱地址';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = '联系地址不能为空';
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

      const url = mode === 'edit' ? `/api/suppliers/${supplier?.id}` : '/api/suppliers';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      // 处理空邮箱字段
      const submitData = {
        ...formData,
        email: formData.email.trim() || undefined
      };

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
        alert(mode === 'edit' ? '供应商更新成功' : '供应商创建成功');
      } else {
        throw new Error(result.error || '操作失败');
      }
    } catch (error) {
      console.error('保存供应商失败:', error);
      alert(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单字段变化
  const handleFieldChange = (field: keyof FormData, value: string) => {
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
            <SuppliersIcon size={24} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'edit' ? '编辑供应商' : '新增供应商'}
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
            {/* 供应商名称 */}
            <div className="form-group">
              <label className="form-label">
                供应商名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                placeholder="请输入供应商名称"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {/* 供应商编码 */}
            <div className="form-group">
              <label className="form-label">
                供应商编码 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.code ? 'border-red-300' : ''}`}
                placeholder="请输入供应商编码"
                value={formData.code}
                onChange={(e) => handleFieldChange('code', e.target.value.toUpperCase())}
              />
              {errors.code && <div className="form-error">{errors.code}</div>}
              <div className="form-help">只能包含大写字母、数字、横线和下划线</div>
            </div>

            {/* 联系人 */}
            <div className="form-group">
              <label className="form-label">
                <UserIcon size={16} className="inline mr-1" />
                联系人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.contactPerson ? 'border-red-300' : ''}`}
                placeholder="请输入联系人姓名"
                value={formData.contactPerson}
                onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
              />
              {errors.contactPerson && <div className="form-error">{errors.contactPerson}</div>}
            </div>

            {/* 联系电话 */}
            <div className="form-group">
              <label className="form-label">
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={`input-field ${errors.phone ? 'border-red-300' : ''}`}
                placeholder="请输入手机号码"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>

            {/* 邮箱地址 */}
            <div className="form-group md:col-span-2">
              <label className="form-label">
                <MailIcon size={16} className="inline mr-1" />
                邮箱地址
              </label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                placeholder="请输入邮箱地址（可选）"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
          </div>

          {/* 联系地址 */}
          <div className="form-group">
            <label className="form-label">
              <MapIcon size={16} className="inline mr-1" />
              联系地址 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`input-field ${errors.address ? 'border-red-300' : ''}`}
              placeholder="请输入详细地址"
              value={formData.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>

          {/* 供应商描述 */}
          <div className="form-group">
            <label className="form-label">供应商描述</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="请输入供应商描述信息（可选）"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
            />
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
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <SaveIcon size={16} />
              {mode === 'edit' ? '保存修改' : '创建供应商'}
            </ButtonLoading>
          </div>
        </form>
      </div>
    </div>
  );
}
