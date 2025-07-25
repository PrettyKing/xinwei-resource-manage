'use client';

// 自定义图标组件
const DashboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const MaterialIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const InboundIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v4a2 2 0 002 2h4a2 2 0 002-2v-1M9 9h10V7a2 2 0 00-2-2H9v4z" />
  </svg>
);

const SupplierIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.892-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ViewIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// 统计卡片组件
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: string;
}

const StatCard = ({ title, value, icon, color, bgColor, trend }: StatCardProps) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendIcon />
            <span className="text-sm text-green-600 ml-1">{trend}</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
        <div className={color}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

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
    {
      key: '4',
      orderNumber: 'IN-2025-004',
      supplier: '东方建材',
      materials: 12,
      amount: 15800,
      status: 'completed',
      date: '2025-07-23',
    },
    {
      key: '5',
      orderNumber: 'IN-2025-005',
      supplier: '恒力材料',
      materials: 6,
      amount: 9200,
      status: 'pending',
      date: '2025-07-23',
    },
  ],
  lowStock: [
    { name: '水泥 42.5R', current: 120, min: 200, unit: '吨', percentage: 60 },
    { name: '钢筋 HRB400', current: 45, min: 100, unit: '吨', percentage: 45 },
    { name: '砂浆添加剂', current: 8, min: 20, unit: '桶', percentage: 40 },
    { name: '防水涂料', current: 25, min: 50, unit: '桶', percentage: 50 },
  ],
};

const statusMap = {
  completed: { color: 'text-green-600', bg: 'bg-green-100', text: '已完成' },
  pending: { color: 'text-orange-600', bg: 'bg-orange-100', text: '待审核' },
  approved: { color: 'text-blue-600', bg: 'bg-blue-100', text: '已审批' },
  draft: { color: 'text-gray-600', bg: 'bg-gray-100', text: '草稿' },
  rejected: { color: 'text-red-600', bg: 'bg-red-100', text: '已拒绝' },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          仪表盘
        </h1>
        <p className="text-gray-600">
          欢迎回来！这里是您的资源管理概览。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="材料总数"
          value={`${mockData.stats.totalMaterials} 种`}
          icon={<MaterialIcon />}
          color="text-blue-600"
          bgColor="bg-blue-100"
          trend="+12%"
        />
        <StatCard
          title="今日入库"
          value={`${mockData.stats.todayInbound} 单`}
          icon={<InboundIcon />}
          color="text-green-600"
          bgColor="bg-green-100"
          trend="+8%"
        />
        <StatCard
          title="供应商数量"
          value={`${mockData.stats.totalSuppliers} 家`}
          icon={<SupplierIcon />}
          color="text-purple-600"
          bgColor="bg-purple-100"
          trend="+3%"
        />
        <StatCard
          title="本月采购额"
          value={`¥${mockData.stats.monthlyValue.toLocaleString()}`}
          icon={<MoneyIcon />}
          color="text-orange-600"
          bgColor="bg-orange-100"
          trend="+15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近入库记录 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <TrendIcon />
                <h2 className="text-lg font-semibold text-gray-900 ml-2">最近入库记录</h2>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                <ViewIcon />
                <span className="ml-1">查看全部</span>
              </button>
            </div>
            
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">入库单号</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">供应商</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">材料种类</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">金额</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.recentInbound.map((item) => (
                      <tr key={item.key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">{item.orderNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">{item.supplier}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">{item.materials} 种</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">¥{item.amount.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusMap[item.status as keyof typeof statusMap].bg
                          } ${statusMap[item.status as keyof typeof statusMap].color}`}>
                            {statusMap[item.status as keyof typeof statusMap].text}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">{item.date}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 库存预警 */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <AlertIcon />
                <h2 className="text-lg font-semibold text-gray-900 ml-2">库存预警</h2>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                <ViewIcon />
                <span className="ml-1">查看全部</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {mockData.lowStock.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                    <span className="text-xs text-gray-500">
                      {item.current}/{item.min} {item.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.percentage < 50 ? 'bg-red-500' : item.percentage < 70 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className={`text-xs font-medium ${
                      item.percentage < 50 ? 'text-red-600' : item.percentage < 70 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {item.percentage}%
                    </span>
                    {item.percentage < 50 && (
                      <span className="text-xs text-red-600 font-medium">库存不足</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
