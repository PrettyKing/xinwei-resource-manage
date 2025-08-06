'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats } from '@/types/business';
import { 
  DashboardIcon,
  MaterialsIcon,
  SuppliersIcon,
  InboundIcon,
  AlertIcon,
  TrendUpIcon,
  CalendarIcon
} from '@/components/icons/index';
import { PageLoading, LocalLoading } from '@/components/Loading';

interface DashboardPageState {
  stats: DashboardStats | null;
  loading: boolean;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [state, setState] = useState<DashboardPageState>({
    stats: null,
    loading: true,
  });

  // 获取仪表盘统计数据
  const fetchStats = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // 添加认证头
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/dashboard/stats', {
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('登录已过期，请重新登录');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          stats: result.data,
          loading: false
        }));
      } else {
        throw new Error(result.error || '获取统计数据失败');
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setState(prev => ({ ...prev, loading: false }));
      // 显示错误提示
      alert(error instanceof Error ? error.message : '获取统计数据失败');
    }
  };

  // 初始化加载
  useEffect(() => {
    if (token) { // 只有在有token时才获取数据
      fetchStats();
    }
  }, [token]);

  // 格式化数字
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 格式化时间
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // 获取活动类型图标和颜色
  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'inbound_created':
        return { icon: <InboundIcon size={16} />, color: 'text-blue-500 bg-blue-50' };
      case 'inbound_approved':
        return { icon: <InboundIcon size={16} />, color: 'text-green-500 bg-green-50' };
      case 'inbound_completed':
        return { icon: <InboundIcon size={16} />, color: 'text-purple-500 bg-purple-50' };
      case 'material_added':
        return { icon: <MaterialsIcon size={16} />, color: 'text-orange-500 bg-orange-50' };
      case 'supplier_added':
        return { icon: <SuppliersIcon size={16} />, color: 'text-cyan-500 bg-cyan-50' };
      default:
        return { icon: <CalendarIcon size={16} />, color: 'text-gray-500 bg-gray-50' };
    }
  };

  // 如果还在加载认证状态，显示加载页面
  if (!user && state.loading) {
    return <PageLoading visible={true} tip="加载仪表盘数据中..." />;
  }

  // 如果未认证，不渲染内容（让 ProtectedRoute 处理重定向）
  if (!user || !token) {
    return null;
  }

  const stats = state.stats;
  if (state.loading) {
    return <PageLoading visible={true} tip="加载仪表盘数据中..." />;
  }

  if (!stats) {
    return (
      <div className="page-container">
        <div className="content-card text-center py-12">
          <div className="text-gray-500">暂无数据</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* 页面头部 */}
      <div className="content-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <DashboardIcon size={28} className="text-blue-600" />
              仪表盘
            </h1>
            <p className="text-gray-600 mt-1">
              欢迎回来，{user?.username}！这里是您的工作概览
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            最后更新：{formatDateTime(new Date())}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* 总材料数 */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">总材料数</p>
                <p className="text-3xl font-bold">{formatNumber(stats.totalMaterials)}</p>
                <p className="text-blue-100 text-sm mt-1">种类</p>
              </div>
              <MaterialsIcon size={48} className="text-blue-200" />
            </div>
          </div>

          {/* 总供应商数 */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">总供应商数</p>
                <p className="text-3xl font-bold">{formatNumber(stats.totalSuppliers)}</p>
                <p className="text-green-100 text-sm mt-1">合作中</p>
              </div>
              <SuppliersIcon size={48} className="text-green-200" />
            </div>
          </div>

          {/* 待审核入库单 */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">待审核入库单</p>
                <p className="text-3xl font-bold">{formatNumber(stats.pendingInbounds)}</p>
                <p className="text-yellow-100 text-sm mt-1">需要处理</p>
              </div>
              <InboundIcon size={48} className="text-yellow-200" />
            </div>
          </div>

          {/* 库存不足材料 */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">库存不足材料</p>
                <p className="text-3xl font-bold">{formatNumber(stats.lowStockMaterials)}</p>
                <p className="text-red-100 text-sm mt-1">需要补货</p>
              </div>
              <AlertIcon size={48} className="text-red-200" />
            </div>
          </div>
        </div>

        {/* 库存价值和本月入库 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 库存总价值 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">库存总价值</h3>
              <TrendUpIcon size={20} className="text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-sm text-gray-600">
              基于当前库存数量和材料单价计算
            </p>
          </div>

          {/* 本月入库统计 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">本月入库统计</h3>
              <InboundIcon size={20} className="text-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.monthlyInboundCount)}
                </div>
                <p className="text-sm text-gray-600">入库单数</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.monthlyInboundValue)}
                </div>
                <p className="text-sm text-gray-600">入库金额</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="content-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">最近活动</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            查看全部
          </button>
        </div>

        {stats.recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">暂无最近活动</div>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.recentActivities.map((activity) => {
              const config = getActivityConfig(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      操作人：{activity.userName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 快捷操作 */}
      <div className="content-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">快捷操作</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.href = '/dashboard/materials'}
            className="p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center group"
          >
            <MaterialsIcon size={32} className="text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-gray-900">材料管理</div>
            <div className="text-xs text-gray-600 mt-1">查看和管理材料</div>
          </button>

          <button
            onClick={() => window.location.href = '/dashboard/inbound'}
            className="p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-center group"
          >
            <InboundIcon size={32} className="text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-gray-900">入库管理</div>
            <div className="text-xs text-gray-600 mt-1">创建和处理入库单</div>
          </button>

          <button
            onClick={() => window.location.href = '/dashboard/suppliers'}
            className="p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center group"
          >
            <SuppliersIcon size={32} className="text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-gray-900">供应商管理</div>
            <div className="text-xs text-gray-600 mt-1">管理供应商信息</div>
          </button>

          <button
            onClick={() => window.location.href = '/dashboard/reports'}
            className="p-6 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors text-center group"
          >
            <CalendarIcon size={32} className="text-orange-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-gray-900">统计报表</div>
            <div className="text-xs text-gray-600 mt-1">查看各类报表</div>
          </button>
        </div>
      </div>

      {/* 如果有库存不足的材料，显示警告 */}
      {stats.lowStockMaterials > 0 && (
        <div className="content-card border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertIcon size={24} className="text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">库存预警</h3>
              <p className="text-red-700">
                有 {stats.lowStockMaterials} 种材料库存不足，请及时补货。
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/materials?lowStock=true'}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                查看详情 →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
