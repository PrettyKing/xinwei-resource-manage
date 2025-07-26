'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon,
  MailIcon, 
  LockIcon, 
  EyeIcon, 
  EyeSlashIcon,
  SaveIcon,
  CheckIcon
} from '@/components/icons';
import { ButtonLoading } from '@/components/Loading';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  realName: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function InitAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [needsInit, setNeedsInit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    realName: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 检查是否需要初始化
  useEffect(() => {
    checkInitStatus();
  }, []);

  const checkInitStatus = async () => {
    try {
      const response = await fetch('/api/init-admin');
      const result = await response.json();
      
      if (result.success) {
        if (result.data.hasAdmin) {
          // 已有管理员，重定向到登录页
          router.push('/login');
        } else {
          setNeedsInit(true);
        }
      }
    } catch (error) {
      console.error('检查初始化状态失败:', error);
      setNeedsInit(true); // 出错时也显示初始化页面
    } finally {
      setChecking(false);
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线，长度3-20位';
    }

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入正确的邮箱地址';
    }

    if (!formData.password.trim()) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少6位';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    if (!formData.realName.trim()) {
      newErrors.realName = '真实姓名不能为空';
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
      const response = await fetch('/api/init-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          realName: formData.realName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('初始管理员创建成功！请使用新账户登录。');
        router.push('/login');
      } else {
        throw new Error(result.error || '创建失败');
      }
    } catch (error) {
      console.error('创建初始管理员失败:', error);
      alert(error instanceof Error ? error.message : '创建失败');
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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">检查系统状态中...</p>
        </div>
      </div>
    );
  }

  if (!needsInit) {
    return null; // 会被重定向，这里返回null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-md w-full">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            系统初始化
          </h1>
          <p className="text-gray-600">
            创建第一个管理员账户来开始使用信维资源管理系统
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名 */}
            <div className="form-group">
              <label className="form-label">
                <UserIcon size={16} className="inline mr-1" />
                管理员用户名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.username ? 'border-red-300' : ''}`}
                placeholder="请输入管理员用户名"
                value={formData.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
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
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* 真实姓名 */}
            <div className="form-group">
              <label className="form-label">
                真实姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.realName ? 'border-red-300' : ''}`}
                placeholder="请输入真实姓名"
                value={formData.realName}
                onChange={(e) => handleFieldChange('realName', e.target.value)}
              />
              {errors.realName && <div className="form-error">{errors.realName}</div>}
            </div>

            {/* 密码 */}
            <div className="form-group">
              <label className="form-label">
                <LockIcon size={16} className="inline mr-1" />
                登录密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.password ? 'border-red-300' : ''}`}
                  placeholder="请输入登录密码"
                  value={formData.password}
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

            {/* 确认密码 */}
            <div className="form-group">
              <label className="form-label">
                <LockIcon size={16} className="inline mr-1" />
                确认密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            {/* 提交按钮 */}
            <ButtonLoading
              type="submit"
              loading={loading}
              loadingText="创建中..."
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              <SaveIcon size={18} />
              创建管理员账户
            </ButtonLoading>
          </form>

          {/* 说明文字 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <CheckIcon size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">重要提示：</p>
                <p>此账户将拥有系统最高权限，请妥善保管账户信息。创建完成后，您可以使用此账户登录并管理其他用户。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
