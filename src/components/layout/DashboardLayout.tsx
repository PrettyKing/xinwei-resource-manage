'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  DashboardIcon,
  MaterialsIcon,
  InboundIcon,
  SuppliersIcon,
  ReportsIcon,
  UserIcon,
  MenuIcon,
  LogoutIcon,
  SettingsIcon,
  ChevronDownIcon,
  SearchIcon,
  BellIcon
} from '@/components/icons';
import { PageLoading } from '@/components/Loading';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 如果未认证，重定向到登录页
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardIcon size={20} />,
      label: '仪表盘',
    },
    {
      key: '/dashboard/materials',
      icon: <MaterialsIcon size={20} />,
      label: '材料管理',
    },
    {
      key: '/dashboard/inbound',
      icon: <InboundIcon size={20} />,
      label: '入库管理',
    },
    {
      key: '/dashboard/suppliers',
      icon: <SuppliersIcon size={20} />,
      label: '供应商管理',
    },
    {
      key: '/dashboard/reports',
      icon: <ReportsIcon size={20} />,
      label: '统计报表',
    },
  ];

  const handleMenuClick = (key: string) => {
    router.push(key);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 获取角色显示名称
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return '系统管理员';
      case 'manager':
        return '管理员';
      case 'operator':
        return '操作员';
      default:
        return '用户';
    }
  };

  // 如果正在加载或未认证，显示页面加载
  if (isLoading || !isAuthenticated) {
    return (
      <PageLoading
        visible={true}
        tip={isLoading ? '正在验证身份...' : '跳转到登录页面...'}
        type="spinner"
        size="lg"
        color="primary"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 侧边栏 */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-xl z-30 transition-all duration-300 border-r border-gray-100 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo 区域 */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600">
          {!collapsed ? (
            <h1 className="text-xl font-bold text-white truncate">
              信维资源管理
            </h1>
          ) : (
            <h1 className="text-xl font-bold text-white">
              信维
            </h1>
          )}
        </div>

        {/* 菜单 */}
        <nav className="mt-6 px-3">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item.key)}
                className={`w-full flex items-center px-4 py-3 my-1 text-left rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                <span className={`transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-500'
                }`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 主内容区域 */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        {/* 顶部导航栏 */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            {/* 左侧 */}
            <div className="flex items-center space-x-4">
              {/* 菜单切换按钮 */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <MenuIcon size={24} />
              </button>
              
              {/* 搜索框 */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="搜索..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 右侧 */}
            <div className="flex items-center space-x-4">
              {/* 通知按钮 */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative">
                <BellIcon size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* 用户菜单 */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.username || '用户'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user ? getRoleDisplayName(user.role) : ''}
                    </span>
                  </div>
                  <ChevronDownIcon size={16} />
                </button>

                {/* 用户下拉菜单 */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 border border-gray-100">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          // TODO: 处理个人资料
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <UserIcon size={16} className="mr-3" />
                        个人资料
                      </button>
                      
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          // TODO: 处理系统设置
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <SettingsIcon size={16} className="mr-3" />
                        系统设置
                      </button>
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <LogoutIcon size={16} className="mr-3" />
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
