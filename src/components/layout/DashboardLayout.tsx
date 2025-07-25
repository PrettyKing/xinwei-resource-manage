'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// 图标组件 (SVG)
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const MaterialsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const InboundIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v4a2 2 0 002 2h4a2 2 0 002-2v-1M9 9h10V7a2 2 0 00-2-2H9v4z" />
  </svg>
);

const SuppliersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

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
      icon: <DashboardIcon />,
      label: '仪表盘',
    },
    {
      key: '/dashboard/materials',
      icon: <MaterialsIcon />,
      label: '材料管理',
    },
    {
      key: '/dashboard/inbound',
      icon: <InboundIcon />,
      label: '入库管理',
    },
    {
      key: '/dashboard/suppliers',
      icon: <SuppliersIcon />,
      label: '供应商管理',
    },
    {
      key: '/dashboard/reports',
      icon: <ReportsIcon />,
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

  // 如果正在加载或未认证，显示加载页面
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-600 font-medium">
            {isLoading ? '正在验证身份...' : '跳转到登录页面...'}
          </div>
        </div>
      </div>
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
                <MenuIcon />
              </button>
              
              {/* 搜索框 */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
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
                <BellIcon />
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
                  <ChevronDownIcon />
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
                        <UserIcon />
                        <span className="ml-3">个人资料</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          // TODO: 处理系统设置
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <SettingsIcon />
                        <span className="ml-3">系统设置</span>
                      </button>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <LogoutIcon />
                        <span className="ml-3">退出登录</span>
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
