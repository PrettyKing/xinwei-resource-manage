'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Result, Button, Spin } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { checkRolePermission } from '@/lib/auth';

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
          <Spin size="large" />
          <div className="mt-4 text-gray-600">正在验证权限...</div>
        </div>
      </div>
    );
  }

  // 如果未认证
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">跳转到登录页面...</div>
        </div>
      </div>
    );
  }

  // 检查角色权限
  const hasPermission = checkRolePermission(user.role, requiredRole);
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Result
          status="403"
          title="403"
          subTitle="抱歉，您没有权限访问此页面。"
          extra={
            <Button type="primary" onClick={() => router.push('/dashboard')}>
              返回首页
            </Button>
          }
        />
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
