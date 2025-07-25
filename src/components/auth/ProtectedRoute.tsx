'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { checkRolePermission } from '@/lib/auth';
import { AlertIcon } from '@/components/icons';
import { PageLoading } from '@/components/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'operator';
  fallback?: React.ReactNode;
  /** 自定义加载文案 */
  loadingTip?: string;
  /** 自定义加载动画类型 */
  loadingType?: 'spinner' | 'dots' | 'wave' | 'circle' | 'pulse';
}

export default function ProtectedRoute({
  children,
  requiredRole = 'operator',
  fallback,
  loadingTip = '正在验证权限...',
  loadingType = 'spinner'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 如果正在加载认证状态，显示页面级加载
  if (isLoading) {
    return (
      <PageLoading
        visible={true}
        tip={loadingTip}
        type={loadingType}
        size="lg"
        color="primary"
      />
    );
  }

  // 如果未认证，显示跳转加载页面
  if (!isAuthenticated || !user) {
    return fallback || (
      <PageLoading
        visible={true}
        tip="跳转到登录页面..."
        type="spinner"
        size="lg"
        color="primary"
      />
    );
  }

  // 检查角色权限
  const hasPermission = checkRolePermission(user.role, requiredRole);
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-red-100 rounded-full">
              <AlertIcon size={40} className="text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">403</h1>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">访问被拒绝</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              抱歉，您的账户权限不足以访问此页面。
              <br />
              当前角色：<span className="font-medium text-gray-800">{getRoleDisplayName(user.role)}</span>
              <br />
              所需权限：<span className="font-medium text-gray-800">{getRoleDisplayName(requiredRole)}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                返回首页
              </button>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                返回上页
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// 获取角色显示名称
function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    admin: '系统管理员',
    manager: '管理员', 
    operator: '操作员'
  };
  return roleMap[role] || '未知角色';
}

// 高阶组件版本，用于页面级别的权限控制
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'admin' | 'manager' | 'operator',
  options?: {
    loadingTip?: string;
    loadingType?: 'spinner' | 'dots' | 'wave' | 'circle' | 'pulse';
  }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute 
        requiredRole={requiredRole}
        loadingTip={options?.loadingTip}
        loadingType={options?.loadingType}
      >
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
      isLoading: false,
    };
  }

  const hasPermission = checkRolePermission(user.role, requiredRole);

  return {
    hasPermission,
    user,
    role: user.role,
    isLoading: false,
  };
}

// 权限检查 Hook，返回加载状态
export function usePermissionWithLoading(requiredRole: 'admin' | 'manager' | 'operator' = 'operator') {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return {
      hasPermission: false,
      user: null,
      role: null,
      isLoading: true,
    };
  }

  if (!isAuthenticated || !user) {
    return {
      hasPermission: false,
      user: null,
      role: null,
      isLoading: false,
    };
  }

  const hasPermission = checkRolePermission(user.role, requiredRole);

  return {
    hasPermission,
    user,
    role: user.role,
    isLoading: false,
  };
}
