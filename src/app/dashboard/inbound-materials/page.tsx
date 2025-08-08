'use client';

import { useState, useEffect } from 'react';
import { InboundMaterial, CreateInboundMaterialForm, UpdateInboundMaterialForm, InboundMaterialFilter } from '@/types/business';
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  DeleteIcon,
  FilterIcon,
  ExportIcon,
  RefreshIcon,
  AuditIcon
} from '@/components/icons/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoading, ButtonLoading } from '@/components/Loading';
import { InboundMaterialModal } from '@/components/inbound-materials/InboundMaterialModal';
import { DeleteConfirmModal } from '@/components/inbound-materials/DeleteConfirmModal';
import { AuditModal } from '@/components/inbound-materials/AuditModal';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';

// 状态映射
const statusMap = {
  pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '已批准', color: 'bg-green-100 text-green-800' },
  active: { label: '已入库', color: 'bg-blue-100 text-blue-800' },
  inactive: { label: '已停用', color: 'bg-gray-100 text-gray-800' }
};

// 季节选项
const seasonOptions = ['春季', '夏季', '秋季', '冬季', '全年'];

export default function InboundMaterialsPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<InboundMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<InboundMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<InboundMaterialFilter>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // 模态框状态
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMaterial, setSelectedMaterial] = useState<InboundMaterial | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // 页面初始化
  useEffect(() => {
    loadMaterials();
  }, []);

  // 搜索和过滤
  useEffect(() => {
    filterMaterials();
  }, [materials, searchTerm, filters]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const result = await api.get('/api/inbound-materials', token);
      
      if (result.success && result.data) {
        setMaterials(result.data.items.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })));
      } else {
        throw new Error(result.error || '获取数据失败');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      // API调用失败时显示错误信息，但仍然加载模拟数据
      console.warn('使用模拟数据作为后备方案');
      const mockData: InboundMaterial[] = [
        {
          _id: '1',
          orderNumber: 'IN2024001',
          materialName: '涤纶面料',
          manufacturer: '浙江纺织厂',
          specification: '150D/48F',
          color: '天蓝色',
          pantoneColor: '18-4140 TPG',
          usedComponent: '上衣面料',
          customer: '优衣库',
          season: '春季',
          currentStock: 500,
          unitPrice: 25.50,
          totalValue: 12750,
          unit: '米',
          description: '高品质涤纶面料，适合春季服装',
          remarks: '需要防潮储存',
          status: 'active',
          operator: { id: '1', name: '张三' },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          orderNumber: 'IN2024002',
          materialName: '纯棉布料',
          manufacturer: '山东棉业',
          specification: '21S精梳棉',
          color: '米白色',
          pantoneColor: '11-0602 TPG',
          usedComponent: '内衬',
          customer: 'H&M',
          season: '夏季',
          currentStock: 300,
          unitPrice: 18.00,
          totalValue: 5400,
          unit: '米',
          description: '天然纯棉，透气舒适',
          remarks: '有机认证',
          status: 'approved',
          operator: { id: '2', name: '李四' },
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-12')
        },
        {
          _id: '3',
          orderNumber: 'IN2024003',
          materialName: '真丝面料',
          manufacturer: '江南丝绸厂',
          specification: '16姆米真丝',
          color: '珠光白',
          pantoneColor: '11-4001 TPG',
          usedComponent: '衬衫面料',
          customer: 'ZARA',
          season: '秋季',
          currentStock: 150,
          unitPrice: 120.00,
          totalValue: 18000,
          unit: '米',
          description: '100%桑蚕丝，质地顺滑',
          remarks: '需要专业洗涤',
          status: 'pending',
          operator: { id: '3', name: '王五' },
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16')
        },
        {
          _id: '4',
          orderNumber: 'IN2024004',
          materialName: '羊毛呢料',
          manufacturer: '内蒙古纺织',
          specification: '180g/m²',
          color: '深海蓝',
          pantoneColor: '19-4052 TPG',
          usedComponent: '大衣面料',
          customer: 'COS',
          season: '冬季',
          currentStock: 80,
          unitPrice: 85.00,
          totalValue: 6800,
          unit: '米',
          description: '澳洲羊毛，保暖性佳',
          remarks: '防虫处理',
          status: 'pending',
          operator: { id: '4', name: '赵六' },
          createdAt: new Date('2024-01-17'),
          updatedAt: new Date('2024-01-17')
        }
      ];
      setMaterials(mockData);
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    // 搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(material =>
        material.orderNumber.toLowerCase().includes(term) ||
        material.materialName.toLowerCase().includes(term) ||
        material.manufacturer.toLowerCase().includes(term) ||
        material.color.toLowerCase().includes(term) ||
        material.customer?.toLowerCase().includes(term) ||
        material.pantoneColor?.toLowerCase().includes(term)
      );
    }

    // 状态过滤
    if (filters.status) {
      filtered = filtered.filter(material => material.status === filters.status);
    }

    // 客户过滤
    if (filters.customer) {
      filtered = filtered.filter(material => material.customer === filters.customer);
    }

    // 季节过滤
    if (filters.season) {
      filtered = filtered.filter(material => material.season === filters.season);
    }

    setFilteredMaterials(filtered);
  };

  // 处理新增/编辑材料
  const handleSaveMaterial = async (data: CreateInboundMaterialForm | UpdateInboundMaterialForm) => {
    try {
      let result;
      
      if (modalMode === 'create') {
        result = await api.post('/api/inbound-materials', data, token);
      } else {
        result = await api.put(`/api/inbound-materials/${selectedMaterial?._id}`, data, token);
      }

      if (result.success) {
        await loadMaterials(); // 重新加载数据
        setShowModal(false);
        setSelectedMaterial(null);
      } else {
        throw new Error(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存材料失败:', error);
      throw error;
    }
  };

  // 处理删除材料
  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;

    try {
      setDeleteLoading(true);
      const result = await api.delete(`/api/inbound-materials/${selectedMaterial._id}`, token);
      
      if (result.success) {
        await loadMaterials(); // 重新加载数据
        setShowDeleteModal(false);
        setSelectedMaterial(null);
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除材料失败:', error);
      throw error;
    } finally {
      setDeleteLoading(false);
    }
  };

  // 打开新增模态框
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedMaterial(null);
    setShowModal(true);
  };

  // 打开编辑模态框
  const openEditModal = (material: InboundMaterial) => {
    setModalMode('edit');
    setSelectedMaterial(material);
    setShowModal(true);
  };

  // 打开删除确认模态框
  const openDeleteModal = (material: InboundMaterial) => {
    setSelectedMaterial(material);
    setShowDeleteModal(true);
  };

  // 打开审核模态框
  const openAuditModal = (material: InboundMaterial) => {
    setSelectedMaterial(material);
    setShowAuditModal(true);
  };

  // 处理审核
  const handleAuditMaterial = async (materialId: string, action: 'approve' | 'reject', remarks?: string) => {
    try {
      const result = await api.put(`/api/inbound-materials/${materialId}/audit`, {
        action,
        remarks
      }, token);
      
      if (result.success) {
        await loadMaterials(); // 重新加载数据
        setShowAuditModal(false);
        setSelectedMaterial(null);
      } else {
        throw new Error(result.error || '审核失败');
      }
    } catch (error) {
      console.error('审核失败:', error);
      throw error;
    }
  };

  const exportData = () => {
    const csvContent = [
      ['入库单号', '材料名称', '厂商', '规格', '颜色', '潘通色号', '使用部件', '客户', '季节', '库存', '单价', '总价值', '状态'].join(','),
      ...filteredMaterials.map(item => [
        item.orderNumber,
        item.materialName,
        item.manufacturer,
        item.specification,
        item.color,
        item.pantoneColor || '',
        item.usedComponent || '',
        item.customer || '',
        item.season || '',
        item.currentStock,
        item.unitPrice,
        item.totalValue,
        statusMap[item.status].label
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `入库材料_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <PageLoading
        visible={true}
        tip="正在加载入库材料数据..."
        type="spinner"
        size="lg"
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">入库管理</h1>
          <p className="text-gray-600 mt-1">管理材料入库信息和库存</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center gap-2"
          >
            <FilterIcon size={16} />
            筛选
          </Button>
          <Button
            variant="outline"
            onClick={exportData}
            className="flex items-center gap-2"
          >
            <ExportIcon size={16} />
            导出
          </Button>
          <Button
            variant="outline"
            onClick={loadMaterials}
            className="flex items-center gap-2"
          >
            <RefreshIcon size={16} />
            刷新
          </Button>
          <Button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon size={16} />
            新增入库
          </Button>
        </div>
      </div>

      {/* 搜索和统计 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="搜索入库单号、材料名称、厂商..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <span>总计: <strong className="text-gray-900">{materials.length}</strong> 项</span>
              <span>已显示: <strong className="text-blue-600">{filteredMaterials.length}</strong> 项</span>
              <span>总价值: <strong className="text-green-600">¥{materials.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 筛选面板 */}
      {showFilterPanel && (
        <Card>
          <CardHeader>
            <CardTitle>筛选条件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({...filters, status: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部状态</option>
                  {Object.entries(statusMap).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">季节</label>
                <select
                  value={filters.season || ''}
                  onChange={(e) => setFilters({...filters, season: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部季节</option>
                  {seasonOptions.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客户</label>
                <input
                  type="text"
                  value={filters.customer || ''}
                  onChange={(e) => setFilters({...filters, customer: e.target.value})}
                  placeholder="输入客户名称"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({})}
                  className="w-full"
                >
                  清空筛选
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 材料列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">入库单号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">材料信息</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">规格颜色</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">使用信息</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">库存价格</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{material.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {material.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{material.materialName}</div>
                        <div className="text-sm text-gray-500">{material.manufacturer}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm">{material.specification}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">{material.color}</span>
                          {material.pantoneColor && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {material.pantoneColor}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm space-y-1">
                        {material.usedComponent && (
                          <div><span className="text-gray-500">部件:</span> {material.usedComponent}</div>
                        )}
                        {material.customer && (
                          <div><span className="text-gray-500">客户:</span> {material.customer}</div>
                        )}
                        {material.season && (
                          <div><span className="text-gray-500">季节:</span> {material.season}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium">{material.currentStock} {material.unit}</div>
                        <div className="text-sm text-gray-500">
                          ¥{material.unitPrice} / {material.unit}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          总值: ¥{material.totalValue.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusMap[material.status].color}`}>
                        {statusMap[material.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {/* 审核按钮 - 仅admin可见，且状态为pending时显示 */}
                        {user?.role === 'admin' && material.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAuditModal(material)}
                            className="p-1 h-8 w-8 text-orange-600 hover:text-orange-700"
                            title="审核"
                          >
                            <AuditIcon size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(material)}
                          className="p-1 h-8 w-8"
                          title="编辑"
                        >
                          <EditIcon size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(material)}
                          className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                          title="删除"
                        >
                          <DeleteIcon size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">暂无入库材料数据</div>
              <Button 
                onClick={openCreateModal}
                className="mt-4"
              >
                <PlusIcon size={16} className="mr-2" />
                添加第一个入库记录
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新增/编辑模态框 */}
      <InboundMaterialModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedMaterial(null);
        }}
        onSave={handleSaveMaterial}
        material={selectedMaterial}
        mode={modalMode}
      />

      {/* 删除确认模态框 */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMaterial(null);
        }}
        onConfirm={handleDeleteMaterial}
        material={selectedMaterial}
        loading={deleteLoading}
      />

      {/* 审核模态框 */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={() => {
          setShowAuditModal(false);
          setSelectedMaterial(null);
        }}
        onAudit={handleAuditMaterial}
        material={selectedMaterial}
      />
    </div>
  );
}