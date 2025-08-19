'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Supplier, SupplierFilter, PaginationParams } from '@/types/business';
import { 
  SuppliersIcon, 
  SearchIcon, 
  PlusIcon, 
  EditIcon, 
  DeleteIcon,
  RefreshIcon,
  UserIcon,
  MailIcon,
  MapIcon,
  BuildingIcon
} from '@/components/icons/index';
import { PageLoading, LocalLoading } from '@/components/Loading';
import SupplierModal from '@/components/SupplierModal';
import SupplierDeleteConfirmModal from '@/components/SupplierDeleteConfirmModal';

interface SuppliersPageState {
  suppliers: Supplier[];
  loading: boolean;
  filter: SupplierFilter;
  pagination: PaginationParams;
  total: number;
  selectedSupplier: Supplier | null;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  refreshing: boolean;
}

export default function SuppliersPage() {
  const { user, token } = useAuth();
  const [state, setState] = useState<SuppliersPageState>({
    suppliers: [],
    loading: true,
    filter: {},
    pagination: { page: 1, pageSize: 20, sortBy: 'updatedAt', sortOrder: 'desc' },
    total: 0,
    selectedSupplier: null,
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    refreshing: false,
  });

  // 获取供应商列表
  const fetchSuppliers = async (showRefreshing = false) => {
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

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/suppliers?${params}`, {
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
          suppliers: result.data.items || [],
          total: result.data.total || 0,
          loading: false,
          refreshing: false
        }));
      } else {
        throw new Error(result.error || '获取供应商列表失败');
      }
    } catch (error) {
      console.error('获取供应商列表失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        refreshing: false,
        suppliers: [],
        total: 0
      }));
      alert(error instanceof Error ? error.message : '获取供应商列表失败');
    }
  };

  // 初始化加载
  useEffect(() => {
    if (token) {
      fetchSuppliers();
    }
  }, [token, state.pagination, state.filter]);

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
    fetchSuppliers(true);
  };

  // 删除供应商
  const handleDeleteSupplier = async () => {
    if (!state.selectedSupplier) return;

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/suppliers/${state.selectedSupplier._id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('登录已过期，请重新登录');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('删除成功');
        setState(prev => ({ ...prev, selectedSupplier: null, showDeleteModal: false }));
        fetchSuppliers();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除供应商失败:', error);
      throw error;
    }
  };

  // 格式化状态
  const getStatusConfig = (status: string) => {
    if (status === 'active') {
      return { text: '启用', color: 'text-green-600 bg-green-50' };
    } else {
      return { text: '禁用', color: 'text-red-600 bg-red-50' };
    }
  };

  // 模态框处理函数
  const handleModalSuccess = () => {
    fetchSuppliers();
  };

  const openCreateModal = () => {
    setState(prev => ({ ...prev, showCreateModal: true, selectedSupplier: null }));
  };

  const openEditModal = (supplier: Supplier) => {
    setState(prev => ({ ...prev, showEditModal: true, selectedSupplier: supplier }));
  };

  const openDeleteModal = (supplier: Supplier) => {
    setState(prev => ({ ...prev, showDeleteModal: true, selectedSupplier: supplier }));
  };

  const closeModals = () => {
    setState(prev => ({ 
      ...prev, 
      showCreateModal: false, 
      showEditModal: false, 
      showDeleteModal: false,
      selectedSupplier: null 
    }));
  };

  // 如果还在加载认证状态，显示加载页面
  if (!user && state.loading) {
    return <PageLoading visible={true} tip="加载供应商数据中..." />;
  }

  // 如果未认证，不渲染内容
  if (!user || !token) {
    return null;
  }

  return (
    <div className="page-container">
      {/* 页面头部 */}
      <div className="content-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <SuppliersIcon size={28} className="text-purple-600" />
              供应商管理
            </h1>
            <p className="text-gray-600 mt-1">管理系统中的所有供应商信息</p>
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
              onClick={openCreateModal}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon size={16} />
              新增供应商
            </button>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索供应商名称、编码或联系人..."
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
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </select>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{state.total}</div>
            <div className="text-sm text-gray-600">总供应商数</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {state.suppliers.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">启用中</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">
              {state.suppliers.filter(s => s.status === 'inactive').length}
            </div>
            <div className="text-sm text-gray-600">已禁用</div>
          </div>
        </div>
      </div>

      {/* 供应商列表 */}
      <div className="content-card">
        <LocalLoading spinning={state.loading}>
          {state.suppliers.length === 0 ? (
            <div className="text-center py-12">
              <SuppliersIcon size={64} className="text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 text-lg mb-2">暂无供应商数据</div>
              <div className="text-gray-400 text-sm mb-4">
                {state.filter.keyword || state.filter.status
                  ? '没有找到符合条件的供应商'
                  : '点击上方"新增供应商"按钮开始添加供应商'
                }
              </div>
              {(!state.filter.keyword && !state.filter.status) && (
                <button
                  onClick={openCreateModal}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <PlusIcon size={16} />
                  新增供应商
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
                        onClick={() => handleSort('code')}
                      >
                        供应商编码
                        {state.pagination.sortBy === 'code' && (
                          <span className="ml-1">
                            {state.pagination.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        供应商名称
                        {state.pagination.sortBy === 'name' && (
                          <span className="ml-1">
                            {state.pagination.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        联系信息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        联系地址
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
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
                    {state.suppliers.map((supplier) => {
                      const statusConfig = getStatusConfig(supplier.status);
                      return (
                        <tr key={supplier._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {supplier.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <BuildingIcon size={16} className="text-gray-400" />
                                {supplier.name}
                              </div>
                              {supplier.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {supplier.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900 flex items-center gap-2">
                                <UserIcon size={14} className="text-gray-400" />
                                {supplier.contactPerson}
                              </div>
                              <div className="text-sm text-gray-500">{supplier.phone}</div>
                              {supplier.email && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <MailIcon size={14} className="text-gray-400" />
                                  {supplier.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 flex items-center gap-2 max-w-xs">
                              <MapIcon size={14} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate" title={supplier.address}>
                                {supplier.address}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              {statusConfig.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(supplier.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(supplier)}
                                className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                                title="编辑供应商"
                              >
                                <EditIcon size={16} />
                              </button>
                              {(user?.role === 'admin' || user?.role === 'manager') && (
                                <button
                                  onClick={() => openDeleteModal(supplier)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="删除供应商"
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

      {/* 模态框组件 */}
      <SupplierModal
        isOpen={state.showCreateModal}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
        mode="create"
      />

      <SupplierModal
        isOpen={state.showEditModal}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
        supplier={state.selectedSupplier}
        mode="edit"
      />

      <SupplierDeleteConfirmModal
        isOpen={state.showDeleteModal}
        onClose={closeModals}
        onConfirm={handleDeleteSupplier}
        supplier={state.selectedSupplier}
      />
    </div>
  );
}
