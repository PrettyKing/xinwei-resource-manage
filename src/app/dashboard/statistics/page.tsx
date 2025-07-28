'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface StockOverview {
  totalItems: number;
  totalValue: number;
  totalQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
  averageValue: number;
}

interface InboundOverview {
  totalOrders: number;
  totalAmount: number;
  completedOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  completedAmount: number;
  averageAmount: number;
  completionRate: string;
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(false);
  const [stockOverview, setStockOverview] = useState<StockOverview | null>(null);
  const [inboundOverview, setInboundOverview] = useState<InboundOverview | null>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
    end: new Date()
  });

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 加载库存概览
      const stockRes = await fetch('/api/statistics/stock?type=overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (stockRes.ok) {
        const data = await stockRes.json();
        setStockOverview(data.data);
      }

      // 加载入库概览
      const params = new URLSearchParams({
        type: 'overview',
        ...(dateRange.start && { startDate: dateRange.start.toISOString().split('T')[0] }),
        ...(dateRange.end && { endDate: dateRange.end.toISOString().split('T')[0] })
      });
      
      const inboundRes = await fetch(`/api/statistics/inbound?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (inboundRes.ok) {
        const data = await inboundRes.json();
        setInboundOverview(data.data);
      }

      // 加载分类统计
      const categoryRes = await fetch('/api/statistics/stock?type=category', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (categoryRes.ok) {
        const data = await categoryRes.json();
        setCategoryStats(data.data);
      }

      // 加载月度统计
      const monthlyRes = await fetch('/api/statistics/inbound?type=monthly', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        setMonthlyStats(data.data);
      }
      
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type: string) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        type,
        format: 'csv',
        ...(dateRange.start && { startDate: dateRange.start.toISOString().split('T')[0] }),
        ...(dateRange.end && { endDate: dateRange.end.toISOString().split('T')[0] })
      });
      
      const response = await fetch(`/api/reports?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('下载报表失败:', error);
    }
  };

  // 图表配置
  const categoryChartData = {
    labels: categoryStats.map(item => item.categoryName),
    datasets: [
      {
        label: '库存价值',
        data: categoryStats.map(item => item.totalValue),
        backgroundColor: [
          '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
          '#6366F1', '#84CC16', '#F97316', '#EC4899', '#14B8A6'
        ].slice(0, categoryStats.length),
      }
    ]
  };

  const monthlyChartData = {
    labels: monthlyStats.map(item => item.monthLabel),
    datasets: [
      {
        label: '入库订单数',
        data: monthlyStats.map(item => item.orderCount),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: '入库金额',
        data: monthlyStats.map(item => item.totalAmount),
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        yAxisID: 'y1',
      }
    ]
  };

  const monthlyChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '订单数'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '金额'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">统计分析</h1>
        <div className="flex gap-2">
          <Select onValueChange={(value) => downloadReport(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="下载报表" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory">库存报表</SelectItem>
              <SelectItem value="inbound">入库报表</SelectItem>
              <SelectItem value="supplier">供应商报表</SelectItem>
              <SelectItem value="stockMovement">库存流水</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadStatistics} disabled={loading}>
            刷新数据
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">统计时间范围:</span>
          <DatePicker
            date={dateRange.start}
            onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
            placeholder="开始日期"
          />
          <span className="text-gray-400">至</span>
          <DatePicker
            date={dateRange.end}
            onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
            placeholder="结束日期"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="stock">库存分析</TabsTrigger>
          <TabsTrigger value="inbound">入库分析</TabsTrigger>
          <TabsTrigger value="trend">趋势分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">材料总数</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockOverview?.totalItems || 0}</div>
                <p className="text-xs text-muted-foreground">
                  库存总价值 ¥{stockOverview?.totalValue?.toLocaleString() || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">入库订单</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inboundOverview?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  完成率 {inboundOverview?.completionRate || '0%'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">入库金额</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{inboundOverview?.totalAmount?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  平均 ¥{inboundOverview?.averageAmount?.toLocaleString() || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">库存预警</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stockOverview?.lowStockCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  缺货 {stockOverview?.outOfStockCount || 0} 项
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>按分类库存分布</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryStats.length > 0 ? (
                  <div className="h-80">
                    <Pie data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    暂无数据
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>分类库存详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryStats.slice(0, 5).map((category, index) => (
                    <div key={category._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.categoryName}</p>
                        <p className="text-sm text-gray-500">{category.itemCount} 个材料</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">¥{category.totalValue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{category.totalQuantity} 件</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inbound" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">待处理订单</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inboundOverview?.pendingOrders || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">已审批订单</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inboundOverview?.approvedOrders || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">已完成订单</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {inboundOverview?.completedOrders || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>入库趋势分析</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyStats.length > 0 ? (
                <div className="h-80">
                  <Line data={monthlyChartData} options={monthlyChartOptions} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  暂无数据
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
