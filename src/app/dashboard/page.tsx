'use client';

import { Card, Row, Col, Statistic, Typography, Table, Tag, Progress } from 'antd';
import {
  ShoppingCartOutlined,
  AppstoreOutlined,
  TeamOutlined,
  DollarOutlined,
  TrendingUpOutlined,
  AlertOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// 模拟数据
const mockData = {
  stats: {
    totalMaterials: 156,
    todayInbound: 23,
    totalSuppliers: 45,
    monthlyValue: 127500,
  },
  recentInbound: [
    {
      key: '1',
      orderNumber: 'IN-2025-001',
      supplier: '华润建材有限公司',
      materials: 15,
      amount: 25600,
      status: 'completed',
      date: '2025-07-25',
    },
    {
      key: '2',
      orderNumber: 'IN-2025-002',
      supplier: '金石材料集团',
      materials: 8,
      amount: 18900,
      status: 'pending',
      date: '2025-07-24',
    },
    {
      key: '3',
      orderNumber: 'IN-2025-003',
      supplier: '宏基供应链',
      materials: 22,
      amount: 34200,
      status: 'approved',
      date: '2025-07-24',
    },
  ],
  lowStock: [
    { name: '水泥 42.5R', current: 120, min: 200, unit: '吨' },
    { name: '钢筋 HRB400', current: 45, min: 100, unit: '吨' },
    { name: '砂浆添加剂', current: 8, min: 20, unit: '桶' },
  ],
};

const statusMap = {
  completed: { color: 'green', text: '已完成' },
  pending: { color: 'orange', text: '待审核' },
  approved: { color: 'blue', text: '已审批' },
  draft: { color: 'gray', text: '草稿' },
  rejected: { color: 'red', text: '已拒绝' },
};

export default function DashboardPage() {
  const columns = [
    {
      title: '入库单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '材料种类',
      dataIndex: 'materials',
      key: 'materials',
      render: (count: number) => `${count} 种`,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusMap) => (
        <Tag color={statusMap[status].color}>
          {statusMap[status].text}
        </Tag>
      ),
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <Title level={2} className="mb-2">
          仪表盘
        </Title>
        <Paragraph className="text-gray-600">
          欢迎回来！这里是您的资源管理概览。
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="材料总数"
              value={mockData.stats.totalMaterials}
              prefix={<AppstoreOutlined className="text-blue-500" />}
              suffix="种"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日入库"
              value={mockData.stats.todayInbound}
              prefix={<ShoppingCartOutlined className="text-green-500" />}
              suffix="单"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="供应商数量"
              value={mockData.stats.totalSuppliers}
              prefix={<TeamOutlined className="text-purple-500" />}
              suffix="家"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月采购额"
              value={mockData.stats.monthlyValue}
              prefix={<DollarOutlined className="text-orange-500" />}
              precision={0}
              formatter={(value) => `¥${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最近入库记录 */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center">
                <TrendingUpOutlined className="mr-2" />
                最近入库记录
              </div>
            }
            extra={<a href="/dashboard/inbound">查看全部</a>}
          >
            <Table
              dataSource={mockData.recentInbound}
              columns={columns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 库存预警 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center">
                <AlertOutlined className="mr-2 text-red-500" />
                库存预警
              </div>
            }
            extra={<a href="/dashboard/materials">查看全部</a>}
          >
            <div className="space-y-4">
              {mockData.lowStock.map((item, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-xs text-gray-500">
                      {item.current}/{item.min} {item.unit}
                    </span>
                  </div>
                  <Progress
                    percent={Math.round((item.current / item.min) * 100)}
                    size="small"
                    status={item.current < item.min ? 'exception' : 'normal'}
                    showInfo={false}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
