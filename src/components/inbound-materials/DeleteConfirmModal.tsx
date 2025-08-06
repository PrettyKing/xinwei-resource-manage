'use client';

import { InboundMaterial } from '@/types/business';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XIcon, AlertTriangleIcon } from '@/components/icons/index';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  material: InboundMaterial | null;
  loading?: boolean;
}

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  material, 
  loading = false 
}: DeleteConfirmModalProps) {
  
  if (!isOpen || !material) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangleIcon size={20} />
            确认删除
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8"
            disabled={loading}
          >
            <XIcon size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-gray-700">
            <p className="mb-3">您确定要删除以下入库材料吗？此操作无法撤销。</p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">入库单号:</span>
                <span className="text-sm font-medium">{material.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">材料名称:</span>
                <span className="text-sm font-medium">{material.materialName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">厂商:</span>
                <span className="text-sm font-medium">{material.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">库存:</span>
                <span className="text-sm font-medium">{material.currentStock} {material.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">总价值:</span>
                <span className="text-sm font-medium text-green-600">¥{material.totalValue.toLocaleString()}</span>
              </div>
              {material.customer && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">客户:</span>
                  <span className="text-sm font-medium">{material.customer}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangleIcon size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">注意事项：</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• 删除后将无法恢复该入库记录</li>
                  <li>• 相关的库存记录也会被清除</li>
                  <li>• 如果材料正在被使用，建议先停用而不是删除</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? '删除中...' : '确认删除'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}