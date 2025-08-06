'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LoginIcon,
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@/components/icons/index';
import { PageLoading, ButtonLoading } from '@/components/Loading';

interface LoginForm {
  username: string;
  password: string;
}


// 自定义输入框组件
interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
}

const CustomInput = ({ type = 'text', placeholder, value, onChange, icon, error, required }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-1">
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`block w-full ${icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-10' : 'pr-4'} py-3 border ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

// 消息提示函数
const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
  // 创建临时消息元素
  const messageEl = document.createElement('div');
  messageEl.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  messageEl.textContent = message;
  
  document.body.appendChild(messageEl);
  
  // 动画进入
  setTimeout(() => {
    messageEl.style.transform = 'translateY(0)';
    messageEl.style.opacity = '1';
  }, 100);
  
  // 3秒后移除
  setTimeout(() => {
    messageEl.style.transform = 'translateY(-100%)';
    messageEl.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(messageEl);
    }, 300);
  }, 3000);
};

export default function LoginPage() {
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginData, setLoginData] = useState<LoginForm>({ username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  // 如果已认证，重定向到仪表盘
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // 如果正在加载认证状态，显示页面加载
  if (isLoading) {
    return (
      <PageLoading
        visible={true}
        tip="正在验证登录状态..."
        type="spinner"
        size="lg"
        color="primary"
      />
    );
  }

  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!loginData.username.trim()) {
      newErrors.username = '请输入用户名或邮箱';
    }
    if (!loginData.password) {
      newErrors.password = '请输入密码';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLogin()) return;
    
    setLoginLoading(true);
    try {
      await login(loginData.username, loginData.password);
      showMessage('登录成功！');
      router.push('/dashboard');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : '登录失败', 'error');
    } finally {
      setLoginLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        {/* 头部 */}
        <div className="text-center p-8 pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <LoginIcon size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">鑫威资源管理系统</h1>
          <p className="text-gray-600">材料入库管理后台</p>
        </div>

        {/* 表单内容 */}
        <div className="p-8 pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
              <CustomInput
                placeholder="请输入用户名或邮箱"
                value={loginData.username}
                onChange={(value) => setLoginData({ ...loginData, username: value })}
                icon={<UserIcon size={20} />}
                error={errors.username}
                required
              />
              
              <CustomInput
                type="password"
                placeholder="请输入密码"
                value={loginData.password}
                onChange={(value) => setLoginData({ ...loginData, password: value })}
                icon={<LockIcon size={20} />}
                error={errors.password}
                required
              />

              <ButtonLoading
                type="submit"
                loading={loginLoading}
                loadingText="登录中..."
                size="default"
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center"
              >
                立即登录
              </ButtonLoading>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">测试账号：admin / 123456</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
