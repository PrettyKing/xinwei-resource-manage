'use client';

import { useState } from 'react';
import { Supplier } from '@/types/business';
import { 
  AlertIcon,
  DeleteIcon,
  CloseIcon,
  BuildingIcon,
  UserIcon,
  MapIcon
} from '@/components/icons/index';
import { ButtonLoading } from '@/components/Loading';

interface SupplierDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  supplier: Supplier | null;
  loading?: boolean;
}

export default function SupplierDeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  supplier,
  loading = false 
}: SupplierDeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertIcon size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">删除确认</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={deleting}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              您确定要删除以下供应商吗？此操作不可撤销。
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <BuildingIcon size={16} className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">供应商名称</div>
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">供应商编码</div>
                    <div className="text-sm font-medium text-gray-900">{supplier.code}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserIcon size={16} className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">联系人</div>
                    <div className="text-sm font-medium text-gray-900">
                      {supplier.contactPerson} - {supplier.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapIcon size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">联系地址</div>
                    <div className="text-sm font-medium text-gray-900">{supplier.address}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertIcon size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">注意：</p>
                  <p>删除供应商后，与该供应商相关的历史采购记录和数据将保留，但不能再选择该供应商进行新的采购操作。</p>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={deleting}
            >
              取消
            </button>
            <ButtonLoading
              onClick={handleConfirm}
              loading={deleting}
              loadingText="删除中..."
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <DeleteIcon size={16} />
              确认删除
            </ButtonLoading>
          </div>
        </div>
      </div>
    </div>
  );
}
