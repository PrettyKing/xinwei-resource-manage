'use client';

import { useState } from 'react';
import { Material } from '@/types/business';
import { 
  AlertIcon,
  DeleteIcon,
  CloseIcon
} from '@/components/icons/index';
import { ButtonLoading } from '@/components/Loading';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  material: Material | null;
  loading?: boolean;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  material,
  loading = false 
}: DeleteConfirmModalProps) {
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

  if (!isOpen || !material) return null;

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
              您确定要删除以下材料吗？此操作不可撤销。
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">材料名称：</span>
                  <span className="text-sm font-medium text-gray-900">{material.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">材料编码：</span>
                  <span className="text-sm font-medium text-gray-900">{material.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">当前库存：</span>
                  <span className="text-sm font-medium text-gray-900">
                    {material.currentStock} {material.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">规格：</span>
                  <span className="text-sm font-medium text-gray-900">{material.specification}</span>
                </div>
              </div>
            </div>

            {material.currentStock > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertIcon size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">注意：</p>
                    <p>该材料当前库存为 {material.currentStock} {material.unit}，删除后库存数据将丢失。</p>
                  </div>
                </div>
              </div>
            )}
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
