'use client';

import { useState } from 'react';
import { InboundMaterial } from '@/types/business';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XIcon, CheckIcon, AlertTriangleIcon } from '@/components/icons/index';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudit: (materialId: string, action: 'approve' | 'reject', remarks?: string) => Promise<void>;
  material: InboundMaterial | null;
}

export function AuditModal({
  isOpen,
  onClose,
  onAudit,
  material
}: AuditModalProps) {
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !material) return null;

  const handleAudit = async (action: 'approve' | 'reject') => {
    if (!material) return;

    try {
      setLoading(true);
      await onAudit(material._id, action, remarks);
      onClose();
      setRemarks('');
    } catch (error) {
      console.error('审核失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRemarks('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangleIcon size={20} className="text-orange-500" />
            审核入库材料
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 h-8 w-8"
          >
            <XIcon size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 材料信息 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">材料详情</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">入库单号:</span>
                <div className="font-medium">{material.orderNumber}</div>
              </div>
              <div>
                <span className="text-gray-500">材料名称:</span>
                <div className="font-medium">{material.materialName}</div>
              </div>
              <div>
                <span className="text-gray-500">厂商:</span>
                <div className="font-medium">{material.manufacturer}</div>
              </div>
              <div>
                <span className="text-gray-500">规格:</span>
                <div className="font-medium">{material.specification}</div>
              </div>
              <div>
                <span className="text-gray-500">颜色:</span>
                <div className="font-medium flex items-center gap-2">
                  {material.color}
                  {material.pantoneColor && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {material.pantoneColor}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500">库存:</span>
                <div className="font-medium">{material.currentStock} {material.unit}</div>
              </div>
              <div>
                <span className="text-gray-500">单价:</span>
                <div className="font-medium">¥{material.unitPrice}</div>
              </div>
              <div>
                <span className="text-gray-500">总价值:</span>
                <div className="font-medium text-green-600">¥{material.totalValue.toLocaleString()}</div>
              </div>
            </div>
            {material.description && (
              <div className="mt-3">
                <span className="text-gray-500">描述:</span>
                <div className="mt-1">{material.description}</div>
              </div>
            )}
            {material.remarks && (
              <div className="mt-3">
                <span className="text-gray-500">备注:</span>
                <div className="mt-1">{material.remarks}</div>
              </div>
            )}
          </div>

          {/* 当前状态 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">当前状态</label>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                material.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                material.status === 'approved' ? 'bg-green-100 text-green-800' :
                material.status === 'active' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {material.status === 'pending' ? '待审批' :
                 material.status === 'approved' ? '已批准' :
                 material.status === 'active' ? '已入库' :
                 '已停用'}
              </span>
            </div>
          </div>

          {/* 审核历史 */}
          {material.auditHistory && material.auditHistory.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">审核历史</label>
              <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                {material.auditHistory.map((record, index) => (
                  <div key={index} className="flex justify-between items-start mb-2 last:mb-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          record.action === 'approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.action === 'approve' ? '批准' : '拒绝'}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{record.auditorName}</span>
                      </div>
                      {record.remarks && (
                        <p className="text-xs text-gray-600 mt-1">{record.remarks}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(record.auditDate).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 审核意见 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              审核意见 (可选)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入审核意见..."
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              onClick={() => handleAudit('reject')}
              disabled={loading}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {loading ? '处理中...' : '拒绝'}
            </Button>
            <Button
              onClick={() => handleAudit('approve')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckIcon size={16} className="mr-2" />
              {loading ? '处理中...' : '批准'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}