'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Material, MaterialFilter, PaginationParams, PaginatedResponse } from '@/types/business';
import { 
  MaterialsIcon, 
  SearchIcon, 
  PlusIcon, 
  EditIcon, 
  DeleteIcon,
  FilterIcon,
  ExportIcon,
  AlertIcon
} from '@/components/icons';
import { PageLoading, LocalLoading, ButtonLoading } from '@/components/Loading';

interface MaterialsPageState {
  materials: Material[];
  loading: boolean;
  creating: boolean;
  filter: MaterialFilter;
  pagination: PaginationParams;
  total: number;
  selectedMaterial: Material | null;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
}

export default function MaterialsPage() {
  const { user, token } = useAuth();
  const [state, setState] = useState<MaterialsPageState>({
    materials: [],
    loading: true,
    creating: false,
    filter: {},
    pagination: { page: 1, pageSize: 20, sortBy: 'updatedAt', sortOrder: 'desc' },
    total: 0,
    selectedMaterial: null,
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
  });

  // 获取材料列表
  const fetchMaterials = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const params = new URLSearchParams();
      params.append('page', state.pagination.page.toString());
      params.append('pageSize', state.pagination.pageSize.toString());
      if (state.pagination.sortBy) params.append('sortBy', state.pagination.sortBy);
      if (state.pagination.sortOrder) params.append('sortOrder', state.pagination.sortOrder);
      if (state.filter.keyword) params.append('keyword', state.filter.keyword);
      if (state.filter.categoryId) params.append('categoryId', state.filter.categoryId);
      if (state.filter.status) params.append('status', state.filter.status);
      if (state.filter.lowStock) params.append('lowStock', 'true');

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // 添加认证头
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/materials?${params}`, {
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
          materials: result.data.items || [],
          total: result.data.total || 0,
          loading: false
        }));
      } else {
        throw new Error(result.error || '获取材料列表失败');
      }
    } catch (error) {
      console.error('获取材料列表失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        materials: [],
        total: 0
      }));
      // TODO: 显示错误提示
      alert(error instanceof Error ? error.message : '获取材料列表失败');
    }
  };

  // 初始化加载
  useEffect(() => {
    if (token) { // 只有在有token时才获取数据
      fetchMaterials();
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

  // 删除材料
  const handleDelete = async (material: Material) => {
    if (!window.confirm(`确定要删除材料 "${material.name}" 吗？`)) {
      return;
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/materials/${material.id}`, {
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
        fetchMaterials();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除材料失败:', error);
      alert(error instanceof Error ? error.message : '删除失败');
    }
  };

  // 格式化库存状态
  const getStockStatus = (material: Material) => {
    if (material.currentStock <= material.minStock) {
      return { status: 'low', text: '库存不足', color: 'text-red-600 bg-red-50' };
    } else if (material.currentStock >= material.maxStock) {
      return { status: 'high', text: '库存充足', color: 'text-green-600 bg-green-50' };
    } else {
      return { status: 'normal', text: '库存正常', color: 'text-blue-600 bg-blue-50' };
    }
  };

  // 如果还在加载认证状态，显示加载页面
  if (!user && state.loading) {
    return <PageLoading visible={true} tip="加载材料数据中..." />;
  }

  // 如果未认证，不渲染内容（让 ProtectedRoute 处理重定向）
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
              <MaterialsIcon size={28} className="text-blue-600" />
              材料管理
            </h1>
            <p className="text-gray-600 mt-1">管理系统中的所有材料信息</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setState(prev => ({ ...prev, showCreateModal: true }))}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon size={16} />
              新增材料
            </button>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索材料名称、编码或规格..."
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

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={state.filter.lowStock || false}
              onChange={(e) => setState(prev => ({
                ...prev,
                filter: { ...prev.filter, lowStock: e.target.checked || undefined },
                pagination: { ...prev.pagination, page: 1 }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            只显示库存不足
          </label>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{state.total}</div>
            <div className="text-sm text-gray-600">总材料数</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {state.materials.filter(m => m.currentStock > m.minStock).length}
            </div>
            <div className="text-sm text-gray-600">库存正常</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">
              {state.materials.filter(m => m.currentStock <= m.minStock).length}
            </div>
            <div className="text-sm text-gray-600">库存不足</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {state.materials.filter(m => m.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">启用中</div>
          </div>
        </div>
      </div>

      {/* 材料列表 */}
      <div className="content-card">
        <LocalLoading spinning={state.loading}>
          {state.materials.length === 0 ? (
            <div className="text-center py-12">
              <MaterialsIcon size={64} className="text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 text-lg mb-2">暂无材料数据</div>
              <div className="text-gray-400 text-sm">
                {state.filter.keyword || state.filter.status || state.filter.lowStock
                  ? '没有找到符合条件的材料'
                  : '点击上方"新增材料"按钮开始添加材料'
                }
              </div>
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
                        材料编码
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        材料名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        规格
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        单位
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('currentStock')}
                      >
                        当前库存
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        库存范围
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('price')}
                      >
                        单价
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {state.materials.map((material) => {
                      const stockStatus = getStockStatus(material);
                      return (
                        <tr key={material.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {material.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{material.name}</div>
                              {material.description && (
                                <div className="text-sm text-gray-500">{material.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {material.specification}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {material.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {material.currentStock}
                              </span>
                              {material.currentStock <= material.minStock && (
                                <AlertIcon size={16} className="text-red-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {material.minStock} - {material.maxStock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ¥{material.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setState(prev => ({ 
                                  ...prev, 
                                  selectedMaterial: material, 
                                  showEditModal: true 
                                }))}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <EditIcon size={16} />
                              </button>
                              {(user?.role === 'admin' || user?.role === 'manager') && (
                                <button
                                  onClick={() => handleDelete(material)}
                                  className="text-red-600 hover:text-red-900"
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
                    
                    <span className="text-sm text-gray-700">
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

      {/* TODO: 添加创建/编辑材料的模态框 */}
    </div>
  );
}
