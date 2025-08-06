'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, CreateUserForm, UpdateUserForm } from '@/types/business';
import { 
  CloseIcon,
  UserIcon,
  SaveIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@/components/icons/index';
import { ButtonLoading } from '@/components/Loading';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null; // 编辑时传入用户数据
  mode: 'create' | 'edit';
}

interface FormData extends Partial<CreateUserForm> {
  // 扩展表单数据类型
}

interface FormErrors {
  [key: string]: string;
}

export default function UserModal({ isOpen, onClose, onSuccess, user, mode }: UserModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    role: 'operator',
    realName: '',
    phone: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        setFormData({
          username: user.username,
          email: user.email,
          password: '', // 编辑时密码为空，表示不修改
          role: user.role,
          realName: user.realName || '',
          phone: user.phone || '',
        });
      } else {
        // 创建模式，重置表单
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'operator',
          realName: '',
          phone: '',
        });
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen, mode, user]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username?.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线，长度3-20位';
    }

    if (!formData.email?.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入正确的邮箱地址';
    }

    // 创建模式时密码必填，编辑模式时密码可选
    if (mode === 'create') {
      if (!formData.password?.trim()) {
        newErrors.password = '密码不能为空';
      } else if (formData.password.length < 6) {
        newErrors.password = '密码长度至少6位';
      }
    } else if (mode === 'edit' && formData.password && formData.password.length < 6) {
      newErrors.password = '密码长度至少6位';
    }

    if (!formData.role) {
      newErrors.role = '请选择用户角色';
    }

    if (formData.phone && formData.phone.trim()) {
      if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = '请输入正确的手机号码';
      }
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

      const url = mode === 'edit' ? `/api/users/${user?.id}` : '/api/users';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      // 处理提交数据
      const submitData: any = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        realName: formData.realName?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
      };

      // 只有在密码不为空时才包含密码字段
      if (formData.password && formData.password.trim()) {
        submitData.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
        alert(mode === 'edit' ? '用户更新成功' : '用户创建成功');
      } else {
        throw new Error(result.error || '操作失败');
      }
    } catch (error) {
      console.error('保存用户失败:', error);
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

  // 角色选项
  const roleOptions = [
    { value: 'admin', label: '系统管理员', description: '拥有所有权限' },
    { value: 'manager', label: '管理员', description: '拥有大部分管理权限' },
    { value: 'operator', label: '操作员', description: '基础操作权限' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UserIcon size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'edit' ? '编辑用户' : '新增用户'}
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
            {/* 用户名 */}
            <div className="form-group">
              <label className="form-label">
                用户名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.username ? 'border-red-300' : ''}`}
                placeholder="请输入用户名"
                value={formData.username || ''}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                disabled={mode === 'edit'} // 编辑时用户名不可修改
              />
              {errors.username && <div className="form-error">{errors.username}</div>}
              <div className="form-help">只能包含字母、数字和下划线，长度3-20位</div>
            </div>

            {/* 邮箱 */}
            <div className="form-group">
              <label className="form-label">
                <MailIcon size={16} className="inline mr-1" />
                邮箱地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                placeholder="请输入邮箱地址"
                value={formData.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* 密码 */}
            <div className="form-group">
              <label className="form-label">
                <LockIcon size={16} className="inline mr-1" />
                密码 {mode === 'create' && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.password ? 'border-red-300' : ''}`}
                  placeholder={mode === 'edit' ? '留空表示不修改密码' : '请输入密码'}
                  value={formData.password || ''}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
              <div className="form-help">密码长度至少6位</div>
            </div>

            {/* 真实姓名 */}
            <div className="form-group">
              <label className="form-label">真实姓名</label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入真实姓名（可选）"
                value={formData.realName || ''}
                onChange={(e) => handleFieldChange('realName', e.target.value)}
              />
            </div>

            {/* 手机号码 */}
            <div className="form-group md:col-span-2">
              <label className="form-label">手机号码</label>
              <input
                type="tel"
                className={`input-field ${errors.phone ? 'border-red-300' : ''}`}
                placeholder="请输入手机号码（可选）"
                value={formData.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>
          </div>

          {/* 用户角色 */}
          <div className="form-group">
            <label className="form-label">
              用户角色 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={formData.role === option.value}
                    onChange={(e) => handleFieldChange('role', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      formData.role === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.role === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && <div className="form-error">{errors.role}</div>}
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
              className="btn-primary flex items-center gap-2"
            >
              <SaveIcon size={16} />
              {mode === 'edit' ? '保存修改' : '创建用户'}
            </ButtonLoading>
          </div>
        </form>
      </div>
    </div>
  );
}
