'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserFilter, PaginationParams } from '@/types/business';
import { 
  UserIcon, 
  SearchIcon, 
  PlusIcon, 
  EditIcon, 
  DeleteIcon,
  RefreshIcon,
  MailIcon,
  CalendarIcon
} from '@/components/icons/index';
import { PageLoading, LocalLoading } from '@/components/Loading';
import UserModal from '@/components/UserModal';
import UserDeleteConfirmModal from '@/components/UserDeleteConfirmModal';

interface UsersPageState {
  users: User[];
  loading: boolean;
  filter: UserFilter;
  pagination: PaginationParams;
  total: number;
  selectedUser: User | null;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  refreshing: boolean;
}

export default function UsersPage() {
  const { user: currentUser, token } = useAuth();
  const [state, setState] = useState<UsersPageState>({
    users: [],
    loading: true,
    filter: {},
    pagination: { page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' },
    total: 0,
    selectedUser: null,
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    refreshing: false,
  });

  // 检查权限 - 只有管理员可以访问用户管理
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      // 如果不是管理员，重定向到仪表板
      window.location.href = '/dashboard';
    }
  }, [currentUser]);

  // 获取用户列表
  const fetchUsers = async (showRefreshing = false) => {
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
      if (state.filter.role) params.append('role', state.filter.role);
      if (state.filter.status) params.append('status', state.filter.status);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/users?${params}`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('登录已过期，请重新登录');
        } else if (response.status === 403) {
          throw new Error('权限不足，只有管理员可以管理用户');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          users: result.data.items || [],
          total: result.data.total || 0,
          loading: false,
          refreshing: false
        }));
      } else {
        throw new Error(result.error || '获取用户列表失败');
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        refreshing: false,
        users: [],
        total: 0
      }));
      alert(error instanceof Error ? error.message : '获取用户列表失败');
    }
  };

  // 初始化加载
  useEffect(() => {
    if (token && currentUser?.role === 'admin') {
      fetchUsers();
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
    fetchUsers(true);
  };

  // 删除用户
  const handleDeleteUser = async () => {
    if (!state.selectedUser) return;

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/users/${state.selectedUser.id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('登录已过期，请重新登录');
        } else if (response.status === 403) {
          throw new Error('权限不足');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('删除成功');
        setState(prev => ({ ...prev, selectedUser: null, showDeleteModal: false }));
        fetchUsers();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      throw error;
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
        return '未知角色';
    }
  };

  // 获取角色颜色
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-50';
      case 'manager':
        return 'text-orange-600 bg-orange-50';
      case 'operator':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 格式化状态
  const getStatusConfig = (status: string) => {
    if (status === 'active') {
      return { text: '正常', color: 'text-green-600 bg-green-50' };
    } else {
      return { text: '禁用', color: 'text-red-600 bg-red-50' };
    }
  };

  // 模态框处理函数
  const handleModalSuccess = () => {
    fetchUsers();
  };

  const openCreateModal = () => {
    setState(prev => ({ ...prev, showCreateModal: true, selectedUser: null }));
  };

  const openEditModal = (user: User) => {
    setState(prev => ({ ...prev, showEditModal: true, selectedUser: user }));
  };

  const openDeleteModal = (user: User) => {
    setState(prev => ({ ...prev, showDeleteModal: true, selectedUser: user }));
  };

  const closeModals = () => {
    setState(prev => ({ 
      ...prev, 
      showCreateModal: false, 
      showEditModal: false, 
      showDeleteModal: false,
      selectedUser: null 
    }));
  };

  // 如果还在加载认证状态，显示加载页面
  if (!currentUser && state.loading) {
    return <PageLoading visible={true} tip="加载用户数据中..." />;
  }

  // 如果未认证或不是管理员，不渲染内容
  if (!currentUser || !token || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="page-container">
      {/* 页面头部 */}
      <div className="content-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <UserIcon size={28} className="text-blue-600" />
              用户管理
            </h1>
            <p className="text-gray-600 mt-1">管理系统中的所有用户账户</p>
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
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon size={16} />
              新增用户
            </button>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户名、邮箱或真实姓名..."
              className="input-field pl-10"
              value={state.filter.keyword || ''}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <select
            className="input-field w-40"
            value={state.filter.role || ''}
            onChange={(e) => setState(prev => ({
              ...prev,
              filter: { ...prev.filter, role: e.target.value as any || undefined },
              pagination: { ...prev.pagination, page: 1 }
            }))}
          >
            <option value="">全部角色</option>
            <option value="admin">系统管理员</option>
            <option value="manager">管理员</option>
            <option value="operator">操作员</option>
          </select>

          <select
            className="input-field w-32"
            value={state.filter.status || ''}
            onChange={(e) => setState(prev => ({
              ...prev,
              filter: { ...prev.filter, status: e.target.value as any || undefined },
              pagination: { ...prev.pagination, page: 1 }
            }))}
          >
            <option value="">全部状态</option>
            <option value="active">正常</option>
            <option value="inactive">禁用</option>
          </select>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{state.total}</div>
            <div className="text-sm text-gray-600">总用户数</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">
              {state.users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">管理员</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {state.users.filter(u => u.role === 'manager').length}
            </div>
            <div className="text-sm text-gray-600">管理人员</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {state.users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">活跃用户</div>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="content-card">
        <LocalLoading spinning={state.loading}>
          {state.users.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon size={64} className="text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 text-lg mb-2">暂无用户数据</div>
              <div className="text-gray-400 text-sm mb-4">
                {state.filter.keyword || state.filter.role || state.filter.status
                  ? '没有找到符合条件的用户'
                  : '点击上方"新增用户"按钮开始添加用户'
                }
              </div>
              {(!state.filter.keyword && !state.filter.role && !state.filter.status) && (
                <button
                  onClick={openCreateModal}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <PlusIcon size={16} />
                  新增用户
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
                        onClick={() => handleSort('username')}
                      >
                        用户信息
                        {state.pagination.sortBy === 'username' && (
                          <span className="ml-1">
                            {state.pagination.sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        联系方式
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        角色
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
                    {state.users.map((user) => {
                      const statusConfig = getStatusConfig(user.status);
                      const isCurrentUser = currentUser.id === user.id;
                      
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                  {user.username}
                                  {isCurrentUser && (
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                      当前用户
                                    </span>
                                  )}
                                </div>
                                {user.realName && (
                                  <div className="text-sm text-gray-500">{user.realName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900 flex items-center gap-2">
                                <MailIcon size={14} className="text-gray-400" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="text-sm text-gray-500">{user.phone}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {getRoleDisplayName(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              {statusConfig.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-2">
                              <CalendarIcon size={14} className="text-gray-400" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(user)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="编辑用户"
                              >
                                <EditIcon size={16} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(user)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="删除用户"
                              >
                                <DeleteIcon size={16} />
                              </button>
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
      <UserModal
        isOpen={state.showCreateModal}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
        mode="create"
      />

      <UserModal
        isOpen={state.showEditModal}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
        user={state.selectedUser}
        mode="edit"
      />

      <UserDeleteConfirmModal
        isOpen={state.showDeleteModal}
        onClose={closeModals}
        onConfirm={handleDeleteUser}
        user={state.selectedUser}
        currentUser={currentUser}
      />
    </div>
  );
}
