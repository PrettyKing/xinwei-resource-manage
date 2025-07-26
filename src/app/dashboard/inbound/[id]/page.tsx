'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { InboundOrder } from '@/types/business';
import {
  InboundIcon,
  CheckIcon,
  CloseIcon,
  ClockIcon,
  EditIcon,
  UserIcon,
  CalendarIcon,
  StatusIcon
} from '@/components/icons';
import { PageLoading, LocalLoading } from '@/components/Loading';

// 箭头左图标
const ArrowLeftIcon = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

interface InboundDetailState {
  inbound: InboundOrder | null;
  loading: boolean;
  submitting: boolean;
}

export default function InboundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, token } = useAuth();
  const [state, setState] = useState<InboundDetailState>({
    inbound: null,
    loading: true,
    submitting: false,
  });

  const inboundId = params.id as string;

  // 获取入库单详情
  const fetchInboundDetail = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/inbound/${inboundId}`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('登录已过期，请重新登录');
        }
        if (response.status === 404) {
          throw new Error('入库单不存在');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          inbound: result.data,
          loading: false
        }));
      } else {
        throw new Error(result.error || '获取入库单详情失败');
      }
    } catch (error) {
      console.error('获取入库单详情失败:', error);
      setState(prev => ({ ...prev, loading: false }));
      alert(error instanceof Error ? error.message : '获取入库单详情失败');
      router.push('/dashboard/inbound');
    }
  };

  // 初始化加载
  useEffect(() => {
    if (token && currentUser && inboundId) {
      fetchInboundDetail();
    }
  }, [token, currentUser, inboundId]);

  // 执行入库单操作
  const handleAction = async (action: string, data?: any) => {
    if (!state.inbound) return;

    setState(prev => ({ ...prev, submitting: true }));

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/inbound/${inboundId}/actions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, ...data })
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || '操作成功');
        fetchInboundDetail(); // 重新获取详情
      } else {
        throw new Error(result.error || '操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert(error instanceof Error ? error.message : '操作失败');
    } finally {
      setState(prev => ({ ...prev, submitting: false }));
    }
  };

  // 提交审批
  const handleSubmit = () => {
    if (!confirm('确定要提交审批吗？提交后将无法修改。')) return;
    handleAction('submit');
  };

  // 审批通过
  const handleApprove = () => {
    if (!confirm('确定要审批通过这个入库单吗？')) return;
    handleAction('approve');
  };

  // 审批拒绝
  const handleReject = () => {
    const reason = prompt('请输入拒绝原因：');
    if (!reason || !reason.trim()) {
      alert('请输入拒绝原因');
      return;
    }
    handleAction('reject', { reason });
  };

  // 完成入库
  const handleComplete = () => {
    if (!state.inbound) return;
    
    // 简化处理：使用计划数量作为实际数量
    const actualQuantities: Record<string, number> = {};
    state.inbound.items.forEach(item => {
      actualQuantities[item.id] = item.quantity;
    });

    if (!confirm('确定要完成入库吗？这将更新库存。')) return;
    handleAction('complete', { actualQuantities });
  };

  // 获取状态显示配置
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { text: '草稿', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: EditIcon };
      case 'pending':
        return { text: '待审批', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: ClockIcon };
      case 'approved':
        return { text: '已审批', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckIcon };
      case 'rejected':
        return { text: '已拒绝', color: 'text-red-600 bg-red-50 border-red-200', icon: CloseIcon };
      case 'completed':
        return { text: '已完成', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckIcon };
      default:
        return { text: '未知', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: StatusIcon };
    }
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  // 如果还在加载认证状态，显示加载页面
  if (!currentUser) {
    return <PageLoading visible={true} tip="加载中..." />;
  }

  // 如果未认证，不渲染内容
  if (!token) {
    return null;
  }

  return (
    <div className="page-container">
      <LocalLoading spinning={state.loading}>
        {state.inbound && (
          <>
            {/* 页面头部 */}
            <div className="content-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/dashboard/inbound')}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100"
                    title="返回入库管理"
                  >
                    <ArrowLeftIcon size={20} />
                  </button>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <InboundIcon size={28} className="text-green-600" />
                      入库单详情
                    </h1>
                    <p className="text-gray-600 mt-1">
                      单号：{state.inbound.orderNo}
                    </p>
                  </div>
                </div>

                {/* 状态标签 */}
                <div className="flex items-center gap-3">
                  {(() => {
                    const statusConfig = getStatusConfig(state.inbound.status);
                    const StatusIconComponent = statusConfig.icon;
                    return (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                        <StatusIconComponent size={14} className="mr-2" />
                        {statusConfig.text}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-3 mb-6">
                {state.inbound.status === 'draft' && (
                  <button
                    onClick={handleSubmit}
                    disabled={state.submitting}
                    className="btn-primary"
                  >
                    提交审批
                  </button>
                )}

                {state.inbound.status === 'pending' && currentUser?.role && ['admin', 'manager'].includes(currentUser.role) && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={state.submitting}
                      className="btn-success"
                    >
                      审批通过
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={state.submitting}
                      className="btn-danger"
                    >
                      拒绝
                    </button>
                  </>
                )}

                {state.inbound.status === 'approved' && (
                  <button
                    onClick={handleComplete}
                    disabled={state.submitting}
                    className="btn-primary"
                  >
                    完成入库
                  </button>
                )}
              </div>

              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">入库单标题：</span>
                      <span className="text-sm font-medium">{state.inbound.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">供应商：</span>
                      <span className="text-sm font-medium">
                        {state.inbound.supplier?.name || '未知供应商'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">总金额：</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatAmount(state.inbound.totalAmount)}
                      </span>
                    </div>
                    {state.inbound.remark && (
                      <div>
                        <span className="text-sm text-gray-600">备注：</span>
                        <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                          {state.inbound.remark}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">操作信息</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">创建人：</span>
                      <span className="text-sm font-medium">
                        {state.inbound.submittedBy?.name || '未知'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">创建时间：</span>
                      <span className="text-sm">
                        {(() => {
                          const datetime = formatDateTime(state.inbound.createdAt);
                          return `${datetime.date} ${datetime.time}`;
                        })()}
                      </span>
                    </div>
                    {state.inbound.approvedBy && (
                      <div className="flex items-center gap-2">
                        <UserIcon size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">审批人：</span>
                        <span className="text-sm font-medium">
                          {state.inbound.approvedBy.name}
                        </span>
                      </div>
                    )}
                    {state.inbound.approvedAt && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">审批时间：</span>
                        <span className="text-sm">
                          {(() => {
                            const datetime = formatDateTime(state.inbound.approvedAt);
                            return `${datetime.date} ${datetime.time}`;
                          })()}
                        </span>
                      </div>
                    )}
                    {state.inbound.completedBy && (
                      <div className="flex items-center gap-2">
                        <UserIcon size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">完成人：</span>
                        <span className="text-sm font-medium">
                          {state.inbound.completedBy.name}
                        </span>
                      </div>
                    )}
                    {state.inbound.completedAt && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">完成时间：</span>
                        <span className="text-sm">
                          {(() => {
                            const datetime = formatDateTime(state.inbound.completedAt);
                            return `${datetime.date} ${datetime.time}`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 入库明细 */}
            <div className="content-card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">入库明细</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        材料信息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        规格
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        单位
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        数量
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        单价
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        小计
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        备注
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {state.inbound.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.material?.name || '未知材料'}
                          </div>
                          <div className="text-sm text-gray-500">
                            编号：{item.material?.code || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.material?.specification || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.material?.unit || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatAmount(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          {formatAmount(item.quantity * item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.remark || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        总计：
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-green-600 text-right">
                        {formatAmount(state.inbound.totalAmount)}
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </LocalLoading>
    </div>
  );
}
