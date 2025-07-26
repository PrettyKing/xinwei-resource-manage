'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreateInboundForm, 
  InboundItem, 
  Supplier, 
  Material 
} from '@/types/business';
import {
  CloseIcon,
  PlusIcon,
  DeleteIcon,
  SaveIcon,
  SearchIcon
} from '@/components/icons';
import { LocalLoading } from '@/components/Loading';

interface CreateInboundModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateInboundState {
  form: CreateInboundForm;
  suppliers: Supplier[];
  materials: Material[];
  loading: boolean;
  submitting: boolean;
  errors: Record<string, string>;
}

export default function CreateInboundModal({ 
  visible, 
  onClose, 
  onSuccess 
}: CreateInboundModalProps) {
  const { token } = useAuth();
  const [state, setState] = useState<CreateInboundState>({
    form: {
      title: '',
      supplierId: '',
      remark: '',
      items: [
        {
          materialId: '',
          quantity: 0,
          unitPrice: 0,
          remark: ''
        }
      ]
    },
    suppliers: [],
    materials: [],
    loading: false,
    submitting: false,
    errors: {}
  });

  // 获取供应商选项
  const fetchSuppliers = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/suppliers?options=true', { headers });
      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          suppliers: result.data || []
        }));
      }
    } catch (error) {
      console.error('获取供应商列表失败:', error);
    }
  };

  // 获取材料选项
  const fetchMaterials = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/materials', { headers });
      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          materials: result.data.items || []
        }));
      }
    } catch (error) {
      console.error('获取材料列表失败:', error);
    }
  };

  // 初始化数据
  useEffect(() => {
    if (visible && token) {
      setState(prev => ({ ...prev, loading: true }));
      Promise.all([fetchSuppliers(), fetchMaterials()]).finally(() => {
        setState(prev => ({ ...prev, loading: false }));
      });
    }
  }, [visible, token]);

  // 重置表单
  const resetForm = () => {
    setState(prev => ({
      ...prev,
      form: {
        title: '',
        supplierId: '',
        remark: '',
        items: [
          {
            materialId: '',
            quantity: 0,
            unitPrice: 0,
            remark: ''
          }
        ]
      },
      errors: {}
    }));
  };

  // 关闭模态框
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 验证表单
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!state.form.title.trim()) {
      errors.title = '请输入入库单标题';
    }

    if (!state.form.supplierId) {
      errors.supplierId = '请选择供应商';
    }

    // 验证明细
    state.form.items.forEach((item, index) => {
      if (!item.materialId) {
        errors[`items.${index}.materialId`] = '请选择材料';
      }
      if (item.quantity <= 0) {
        errors[`items.${index}.quantity`] = '数量必须大于0';
      }
      if (item.unitPrice < 0) {
        errors[`items.${index}.unitPrice`] = '单价不能为负数';
      }
    });

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setState(prev => ({ ...prev, submitting: true }));

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/inbound', {
        method: 'POST',
        headers,
        body: JSON.stringify(state.form)
      });

      const result = await response.json();

      if (result.success) {
        alert('入库单创建成功');
        onSuccess();
        handleClose();
      } else {
        throw new Error(result.error || '创建入库单失败');
      }
    } catch (error) {
      console.error('创建入库单失败:', error);
      alert(error instanceof Error ? error.message : '创建入库单失败');
    } finally {
      setState(prev => ({ ...prev, submitting: false }));
    }
  };

  // 更新表单字段
  const updateField = (field: keyof CreateInboundForm, value: any) => {
    setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        [field]: value
      },
      errors: {
        ...prev.errors,
        [field]: ''
      }
    }));
  };

  // 更新明细项
  const updateItem = (index: number, field: keyof InboundItem, value: any) => {
    setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        items: prev.form.items.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      },
      errors: {
        ...prev.errors,
        [`items.${index}.${field}`]: ''
      }
    }));
  };

  // 添加明细项
  const addItem = () => {
    setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        items: [
          ...prev.form.items,
          {
            materialId: '',
            quantity: 0,
            unitPrice: 0,
            remark: ''
          }
        ]
      }
    }));
  };

  // 删除明细项
  const removeItem = (index: number) => {
    if (state.form.items.length <= 1) {
      alert('至少需要保留一个明细项');
      return;
    }

    setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        items: prev.form.items.filter((_, i) => i !== index)
      }
    }));
  };

  // 计算总金额
  const calculateTotal = () => {
    return state.form.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={handleClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">新建入库单</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <LocalLoading spinning={state.loading}>
          <div className="p-6">
            {/* 基本信息 */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    入库单标题 *
                  </label>
                  <input
                    type="text"
                    value={state.form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className={`input-field ${state.errors.title ? 'border-red-300' : ''}`}
                    placeholder="请输入入库单标题"
                  />
                  {state.errors.title && (
                    <p className="text-red-500 text-xs mt-1">{state.errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    供应商 *
                  </label>
                  <select
                    value={state.form.supplierId}
                    onChange={(e) => updateField('supplierId', e.target.value)}
                    className={`input-field ${state.errors.supplierId ? 'border-red-300' : ''}`}
                  >
                    <option value="">请选择供应商</option>
                    {state.suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {state.errors.supplierId && (
                    <p className="text-red-500 text-xs mt-1">{state.errors.supplierId}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={state.form.remark}
                  onChange={(e) => updateField('remark', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="请输入备注信息（可选）"
                />
              </div>
            </div>

            {/* 入库明细 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-900">入库明细</h3>
                <button
                  onClick={addItem}
                  className="btn-secondary flex items-center gap-2"
                >
                  <PlusIcon size={16} />
                  添加明细
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        材料 *
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        数量 *
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        单价 *
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        小计
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        备注
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {state.form.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <select
                            value={item.materialId}
                            onChange={(e) => updateItem(index, 'materialId', e.target.value)}
                            className={`input-field min-w-[200px] ${state.errors[`items.${index}.materialId`] ? 'border-red-300' : ''}`}
                          >
                            <option value="">请选择材料</option>
                            {state.materials.map((material) => (
                              <option key={material.id} value={material.id}>
                                {material.name} ({material.specification})
                              </option>
                            ))}
                          </select>
                          {state.errors[`items.${index}.materialId`] && (
                            <p className="text-red-500 text-xs mt-1">
                              {state.errors[`items.${index}.materialId`]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className={`input-field w-24 ${state.errors[`items.${index}.quantity`] ? 'border-red-300' : ''}`}
                            min="0"
                            step="0.01"
                          />
                          {state.errors[`items.${index}.quantity`] && (
                            <p className="text-red-500 text-xs mt-1">
                              {state.errors[`items.${index}.quantity`]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className={`input-field w-32 ${state.errors[`items.${index}.unitPrice`] ? 'border-red-300' : ''}`}
                            min="0"
                            step="0.01"
                          />
                          {state.errors[`items.${index}.unitPrice`] && (
                            <p className="text-red-500 text-xs mt-1">
                              {state.errors[`items.${index}.unitPrice`]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">
                            {formatAmount(item.quantity * item.unitPrice)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.remark}
                            onChange={(e) => updateItem(index, 'remark', e.target.value)}
                            className="input-field w-32"
                            placeholder="备注"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeItem(index)}
                            disabled={state.form.items.length <= 1}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="删除"
                          >
                            <DeleteIcon size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 总计 */}
              <div className="mt-4 flex justify-end">
                <div className="bg-gray-50 rounded-lg p-4 min-w-[200px]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">总金额：</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatAmount(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </LocalLoading>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="btn-secondary"
            disabled={state.submitting}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={state.submitting}
            className="btn-primary flex items-center gap-2"
          >
            <SaveIcon size={16} />
            {state.submitting ? '创建中...' : '创建入库单'}
          </button>
        </div>
      </div>
    </div>
  );
}
