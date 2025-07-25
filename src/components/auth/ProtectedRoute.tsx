'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { checkRolePermission } from '@/lib/auth';
import { SpinnerIcon, AlertIcon } from '@/components/icons';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'operator';
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole = 'operator',
  fallback
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 如果正在加载认证状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <SpinnerIcon size={48} className="text-blue-500 mx-auto mb-4" />
          <div className="text-gray-600 font-medium">正在验证权限...</div>
        </div>
      </div>
    );
  }

  // 如果未认证
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <SpinnerIcon size={48} className="text-blue-500 mx-auto mb-4" />
          <div className="text-gray-600 font-medium">跳转到登录页面...</div>
        </div>
      </div>
    );
  }

  // 检查角色权限
  const hasPermission = checkRolePermission(user.role, requiredRole);
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
              <AlertIcon size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">403</h1>
            <p className="text-gray-600 mb-4">抱歉，您没有权限访问此页面。</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// 高阶组件版本，用于页面级别的权限控制
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'admin' | 'manager' | 'operator'
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook 版本，用于组件内的权限检查
export function usePermission(requiredRole: 'admin' | 'manager' | 'operator' = 'operator') {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return {
      hasPermission: false,
      user: null,
      role: null,
    };
  }

  const hasPermission = checkRolePermission(user.role, requiredRole);

  return {
    hasPermission,
    user,
    role: user.role,
  };
}
