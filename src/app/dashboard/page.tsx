'use client';

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
    </div>
  );
}
