'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LoginIcon,
  UserIcon,
  LockIcon,
  MailIcon,
  EyeIcon,
  EyeSlashIcon,
  SpinnerIcon
} from '@/components/icons';

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
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

// 自定义按钮组件
interface ButtonProps {
  type?: 'button' | 'submit';
  onClick?: () => void;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const CustomButton = ({ type = 'button', onClick, loading, children, className = '' }: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
  >
    {loading && (
      <SpinnerIcon size={16} className="text-white mr-2" />
    )}
    {children}
  </button>
);

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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState<LoginForm>({ username: '', password: '' });
  const [registerData, setRegisterData] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const { login, register, isAuthenticated, isLoading } = useAuth();

  // 如果已认证，重定向到仪表盘
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // 如果正在加载认证状态，显示加载中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <SpinnerIcon size={48} className="text-blue-500 mx-auto mb-4" />
          <div className="text-gray-600 font-medium">正在验证登录状态...</div>
        </div>
      </div>
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

  const validateRegister = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!registerData.username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (registerData.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }
    
    if (!registerData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    if (!registerData.password) {
      newErrors.password = '请输入密码';
    } else if (registerData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }
    
    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLogin()) return;
    
    setLoading(true);
    try {
      await login(loginData.username, loginData.password);
      showMessage('登录成功！');
      router.push('/dashboard');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : '登录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegister()) return;
    
    setLoading(true);
    try {
      await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });
      showMessage('注册成功！即将跳转到仪表盘');
      router.push('/dashboard');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : '注册失败', 'error');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">信维资源管理系统</h1>
          <p className="text-gray-600">材料入库管理后台</p>
        </div>

        {/* 标签页 */}
        <div className="px-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === 'register'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              注册
            </button>
          </div>
        </div>

        {/* 表单内容 */}
        <div className="p-8 pt-6">
          {activeTab === 'login' ? (
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

              <CustomButton type="submit" loading={loading} className="mt-6">
                {loading ? '登录中...' : '立即登录'}
              </CustomButton>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">测试账号：admin / 123456</p>
                <p className="text-xs text-gray-500 mt-1">没有账号？点击上方注册标签页</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <CustomInput
                placeholder="请输入用户名"
                value={registerData.username}
                onChange={(value) => setRegisterData({ ...registerData, username: value })}
                icon={<UserIcon size={20} />}
                error={errors.username}
                required
              />
              
              <CustomInput
                type="email"
                placeholder="请输入邮箱"
                value={registerData.email}
                onChange={(value) => setRegisterData({ ...registerData, email: value })}
                icon={<MailIcon size={20} />}
                error={errors.email}
                required
              />
              
              <CustomInput
                type="password"
                placeholder="请输入密码"
                value={registerData.password}
                onChange={(value) => setRegisterData({ ...registerData, password: value })}
                icon={<LockIcon size={20} />}
                error={errors.password}
                required
              />
              
              <CustomInput
                type="password"
                placeholder="请再次输入密码"
                value={registerData.confirmPassword}
                onChange={(value) => setRegisterData({ ...registerData, confirmPassword: value })}
                icon={<LockIcon size={20} />}
                error={errors.confirmPassword}
                required
              />

              <CustomButton type="submit" loading={loading} className="mt-6">
                {loading ? '注册中...' : '立即注册'}
              </CustomButton>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">注册后将自动登录系统</p>
                <p className="text-xs text-gray-500 mt-1">已有账号？点击上方登录标签页</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
