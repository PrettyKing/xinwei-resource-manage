'use client';

import { useState } from 'react';
import { User } from '@/types/business';
import { 
  AlertIcon,
  DeleteIcon,
  CloseIcon,
  UserIcon,
  MailIcon
} from '@/components/icons';
import { ButtonLoading } from '@/components/Loading';

interface UserDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: User | null;
  currentUser: User | null;
  loading?: boolean;
}

export default function UserDeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user,
  currentUser,
  loading = false 
}: UserDeleteConfirmModalProps) {
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

  const isSelf = currentUser?.id === user?.id;

  if (!isOpen || !user) return null;

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
            {isSelf ? (
              <div className="mb-4">
                <p className="text-red-700 font-medium mb-2">
                  ⚠️ 警告：您不能删除自己的账户！
                </p>
                <p className="text-gray-600">
                  为了系统安全，不允许删除当前登录的账户。如需删除此账户，请联系其他管理员操作。
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-4">
                  您确定要删除以下用户吗？此操作不可撤销。
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <UserIcon size={16} className="text-gray-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">用户名</div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MailIcon size={16} className="text-gray-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">邮箱地址</div>
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      </div>
                    </div>

                    {user.realName && (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">真实姓名</div>
                          <div className="text-sm font-medium text-gray-900">{user.realName}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">用户角色</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">注册时间</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(user.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertIcon size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">注意：</p>
                      <p>删除用户后，该用户的所有操作记录将被保留，但用户将无法再登录系统。此操作不可撤销，请谨慎操作。</p>
                    </div>
                  </div>
                </div>
              </>
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
            {!isSelf && (
              <ButtonLoading
                onClick={handleConfirm}
                loading={deleting}
                loadingText="删除中..."
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <DeleteIcon size={16} />
                确认删除
              </ButtonLoading>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
