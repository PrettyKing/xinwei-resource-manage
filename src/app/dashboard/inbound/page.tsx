'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { InboundOrder, InboundFilter, PaginationParams } from '@/types/business';
import { 
  InboundIcon,
  SearchIcon, 
  PlusIcon, 
  EyeIcon, 
  EditIcon, 
  DeleteIcon,
  RefreshIcon,
  CalendarIcon,
  StatusIcon,
  CheckIcon,
  CloseIcon,
  ClockIcon
} from '@/components/icons';
import { PageLoading, LocalLoading } from '@/components/Loading';

interface InboundPageState {
  inbounds: InboundOrder[];
  loading: boolean;
  filter: InboundFilter;
  pagination: PaginationParams;
  total: number;
  selectedInbound: InboundOrder | null;
  refreshing: boolean;
}

export default function InboundPage() {
  const { user: currentUser, token } = useAuth();
  const [state, setState] = useState<InboundPageState>({
    inbounds: [],
    loading: true,
    filter: {},
    pagination: { page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' },
    total: 0,
    selectedInbound: null,
    refreshing: false,
  });

  // 获取入库单列表
  const fetchInbounds = async (showRefreshing = false) => {
    setState(prev => ({ 
      ...prev, 
      loading: !showRefreshing,
      refreshing: showRefreshing 
    }));
    
    try {
      const params = new URLSearchParams();
      params.append('page', state.pagination.page.toString());
      params.append('pageSize', state.pagination.pageSize.toString());
      if (state.pagination.sortBy) params.append('sortBy', state.pagination.sortBy);
      if (state.pagination.sortOrder) params.append('sortOrder', state.pagination.sortOrder);
      if (state.filter.keyword) params.append('keyword', state.filter.keyword);
      if (state.filter.status) params.append('status', state.filter.status);
      if (state.filter.supplierId) params.append('supplierId', state.filter.supplierId);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/inbound?${params}`, {
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
          inbounds: result.data.items || [],
          total: result.data.total || 0,
          loading: false,
          refreshing: false
        }));
      } else {
        throw new Error(result.error || '获取入库单列表失败');
      }
    } catch (error) {
      console.error('获取入库单列表失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        refreshing: false,
        inbounds: [],
        total: 0
      }));
      alert(error instanceof Error ? error.message : '获取入库单列表失败');
    }
  };

  // 初始化加载
  useEffect(() => {
    if (token && currentUser) {
      fetchInbounds();
    }
  }, [token, currentUser, state.pagination, state.filter]);

  // 搜索处理
  const handleSearch = (keyword: string) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, keyword },
      pagination: { ...prev.pagination, page: 1 }
    }));
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  };

  // 排序处理
  const handleSort = (sortBy: string) => {
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        sortBy,
        sortOrder: prev.pagination.sortBy === sortBy && prev.pagination.sortOrder === 'asc' ? 'desc' : 'asc'
      }
    }));
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchInbounds(true);
  };

  // 获取状态显示配置
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { text: '草稿', color: 'text-gray-600 bg-gray-50', icon: EditIcon };
      case 'pending':
        return { text: '待审批', color: 'text-yellow-600 bg-yellow-50', icon: ClockIcon };
      case 'approved':
        return { text: '已审批', color: 'text-blue-600 bg-blue-50', icon: CheckIcon };
      case 'rejected':
        return { text: '已拒绝', color: 'text-red-600 bg-red-50', icon: CloseIcon };
      case 'completed':
        return { text: '已完成', color: 'text-green-600 bg-green-50', icon: CheckIcon };
      default:
        return { text: '未知', color: 'text-gray-600 bg-gray-50', icon: StatusIcon };
    }
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  // 删除入库单
  const handleDelete = async (inbound: InboundOrder) => {
    if (!confirm(`确定要删除入库单 ${inbound.orderNo} 吗？`)) {
      return;
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/inbound/${inbound.id}`, {
        method: 'DELETE',
        headers
      });

      const result = await response.json();

      if (result.success) {
        alert('删除成功');
        fetchInbounds();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除入库单失败:', error);
      alert(error instanceof Error ? error.message : '删除失败');
    }
  };

  // 如果还在加载认证状态，显示加载页面
  if (!currentUser && state.loading) {
    return <PageLoading visible={true} tip="加载入库数据中..." />;
  }

  // 如果未认证，不渲染内容
  if (!currentUser || !token) {
    return null;
  }

  return (
    <div className="page-container">
      {/* 页面头部 */}
      <div className="content-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <InboundIcon size={28} className="text-green-600" />
              入库管理
            </h1>
            <p className="text-gray-600 mt-1">管理材料入库单据和库存更新</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={state.refreshing}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshIcon size={16} className={state.refreshing ? 'animate-spin' : ''} />
              刷新
            </button>
            <button
              onClick={() => {/* TODO: 打开创建入库单模态框 */}}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon size={16} />
              新建入库单
            </button>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索入库单号、标题..."
              className="input-field pl-10"
              value={state.filter.keyword || ''}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <select
            className="input-field w-40"
            value={state.filter.status || ''}
            onChange={(e) => setState(prev => ({
              ...prev,
              filter: { ...prev.filter, status: e.target.value as any || undefined },
              pagination: { ...prev.pagination, page: 1 }
            }))}
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="pending">待审批</option>
            <option value="approved">已审批</option>
            <option value="rejected">已拒绝</option>
            <option value="completed">已完成</option>
          </select>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-600">{state.total}</div>
            <div className="text-sm text-gray-600">总入库单</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {state.inbounds.filter(i => i.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">待审批</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {state.inbounds.filter(i => i.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">已审批</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {state.inbounds.filter(i => i.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {formatAmount(state.inbounds.filter(i => i.status === 'completed').reduce((sum, i) => sum + i.totalAmount, 0))}
            </div>
            <div className="text-sm text-gray-600">完成金额</div>
          </div>
        </div>
      </div>

      {/* 入库单列表 */}
      <div className="content-card">
        <LocalLoading spinning={state.loading}>
          {state.inbounds.length === 0 ? (
            <div className="text-center py-12">
              <InboundIcon size={64} className="text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 text-lg mb-2">暂无入库单数据</div>
              <div className="text-gray-400 text-sm mb-4">
                {state.filter.keyword || state.filter.status
                  ? '没有找到符合条件的入库单'
                  : '点击上方"新建入库单"按钮开始创建入库单'
                }
              </div>
              {(!state.filter.keyword && !state.filter.status) && (
                <button
                  onClick={() => {/* TODO: 打开创建入库单模态框 */}}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <PlusIcon size={16} />
                  新建入库单
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('orderNo')}
                      >
                        入库单号
                        {state.pagination.sortBy === 'orderNo' && (
                          <span className="ml-1">
                            {state.pagination.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        标题/供应商
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('totalAmount')}
                      >
                        总金额
                        {state.pagination.sortBy === 'totalAmount' && (
                          <span className="ml-1">
                            {state.pagination.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        创建时间
                        {state.pagination.sortBy === 'createdAt' && (
                          <span className="ml-1">
                            {state.pagination.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {state.inbounds.map((inbound) => {
                      const statusConfig = getStatusConfig(inbound.status);
                      const StatusIconComponent = statusConfig.icon;
                      
                      return (
                        <tr key={inbound.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {inbound.orderNo}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {inbound.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {inbound.supplier?.name || '未知供应商'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              <StatusIconComponent size={12} className="mr-1" />
                              {statusConfig.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatAmount(inbound.totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-2">
                              <CalendarIcon size={14} className="text-gray-400" />
                              {new Date(inbound.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(inbound.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {/* TODO: 查看详情 */}}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="查看详情"
                              >
                                <EyeIcon size={16} />
                              </button>
                              {inbound.status === 'draft' && (
                                <button
                                  onClick={() => {/* TODO: 编辑入库单 */}}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title="编辑入库单"
                                >
                                  <EditIcon size={16} />
                                </button>
                              )}
                              {(inbound.status === 'draft' || inbound.status === 'rejected') && (
                                <button
                                  onClick={() => handleDelete(inbound)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="删除入库单"
                                >
                                  <DeleteIcon size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {state.total > state.pagination.pageSize && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示 {((state.pagination.page - 1) * state.pagination.pageSize) + 1} 到{' '}
                    {Math.min(state.pagination.page * state.pagination.pageSize, state.total)} 条，
                    共 {state.total} 条记录
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(state.pagination.page - 1)}
                      disabled={state.pagination.page <= 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    
                    <span className="text-sm text-gray-700 px-4">
                      第 {state.pagination.page} 页，共{' '}
                      {Math.ceil(state.total / state.pagination.pageSize)} 页
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(state.pagination.page + 1)}
                      disabled={state.pagination.page >= Math.ceil(state.total / state.pagination.pageSize)}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </LocalLoading>
      </div>
    </div>
  );
}
