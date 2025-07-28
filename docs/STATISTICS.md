# 信维资源管理系统 - 统计功能说明

## 📊 统计功能概览

本系统提供了全面的统计分析功能，帮助管理员和用户更好地了解库存状况、入库情况以及业务运营数据。

## 🎯 主要功能模块

### 1. 统计数据 API

#### 📈 仪表盘统计 (`/api/dashboard/stats`)
- 材料总数和库存价值
- 入库订单统计和完成率
- 库存预警信息
- 最近活动记录

#### 📦 库存统计 (`/api/statistics/stock`)
支持多种统计类型：
- **概览统计** (`?type=overview`)：总体库存概况
- **分类统计** (`?type=category`)：按材料分类统计
- **低库存预警** (`?type=lowStock`)：库存不足的材料列表
- **趋势分析** (`?type=trend`)：库存变化趋势

#### 📥 入库统计 (`/api/statistics/inbound`)
支持多种统计类型：
- **概览统计** (`?type=overview`)：入库订单总体情况
- **供应商统计** (`?type=supplier`)：按供应商统计入库情况
- **月度统计** (`?type=monthly`)：按月统计入库趋势
- **状态统计** (`?type=status`)：按订单状态统计

### 2. 报表生成 API (`/api/reports`)

支持多种报表类型，可导出为 JSON 或 CSV 格式：

#### 📋 库存报表 (`?type=inventory`)
- 所有活跃材料的详细信息
- 库存状态分析（正常/低库存/缺货/超储）
- 库存价值统计

#### 📥 入库报表 (`?type=inbound`)
- 指定时间范围内的入库订单
- 订单状态和处理流程追踪
- 供应商和操作员信息

#### 🏢 供应商报表 (`?type=supplier`)
- 供应商基本信息
- 合作情况统计（订单数、金额、完成率）
- 最后合作时间

#### 📊 库存流水报表 (`?type=stockMovement`)
- 库存变动记录
- 操作类型分类（入库/出库/调整）
- 操作员和时间信息

### 3. 统计分析页面 (`/dashboard/statistics`)

#### 🎨 可视化图表
- **饼图**：库存分类分布
- **折线图**：入库趋势分析
- **卡片**：关键指标展示

#### 🔍 数据筛选
- 时间范围选择
- 动态数据刷新
- 实时统计更新

#### 📤 数据导出
- 一键下载各类报表
- CSV 格式支持
- 自定义时间范围

## 🛠️ 技术实现

### 前端技术栈
- **React 18** + **Next.js 14**
- **Chart.js** + **react-chartjs-2** - 图表渲染
- **Tailwind CSS** - 样式框架
- **Radix UI** - 组件库
- **date-fns** - 日期处理

### 后端技术栈
- **Next.js API Routes** - 接口服务
- **MongoDB** + **Mongoose** - 数据存储
- **JWT** - 身份验证
- **Aggregation Pipeline** - 数据聚合

### 数据库设计
使用 MongoDB 聚合管道进行复杂数据统计：
```javascript
// 示例：按分类统计库存
await Material.aggregate([
  { $match: { status: 'active' } },
  { $lookup: { from: 'materialcategories', localField: 'categoryId', foreignField: '_id', as: 'category' } },
  { $group: { _id: '$categoryId', itemCount: { $sum: 1 }, totalValue: { $sum: { $multiply: ['$currentStock', '$price'] } } } }
]);
```

## 📈 统计指标说明

### 库存指标
- **库存价值**：当前库存数量 × 单价
- **库存水平**：当前库存 / 最小库存 × 100%
- **库存状态**：
  - 正常：库存充足
  - 低库存：≤ 最小库存
  - 缺货：库存为 0
  - 超储：≥ 最大库存

### 入库指标
- **完成率**：已完成订单 / 总订单 × 100%
- **平均金额**：总入库金额 / 订单数量
- **处理效率**：各状态订单的分布情况

## 🚀 使用方法

### 1. 访问统计页面
```
登录系统 → 侧边栏 → 统计分析
```

### 2. API 调用示例
```javascript
// 获取库存概览
const response = await fetch('/api/statistics/stock?type=overview', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 下载库存报表
const response = await fetch('/api/reports?type=inventory&format=csv', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 3. 时间范围筛选
```javascript
// 获取指定时间范围的入库统计
const params = new URLSearchParams({
  type: 'overview',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});
```

## 🔒 权限控制

- **所有用户**：可查看基础统计信息
- **管理员**：可访问所有统计功能和报表
- **操作员**：可查看与自己相关的操作记录

## 📱 响应式设计

- 支持桌面端和移动端访问
- 图表自适应屏幕尺寸
- 触摸友好的交互设计

## 🔄 实时更新

- 数据变化后统计信息自动更新
- 支持手动刷新功能
- 缓存优化提升性能

## 🎯 未来规划

- [ ] 更多图表类型（柱状图、雷达图等）
- [ ] 预测分析功能
- [ ] 自定义报表模板
- [ ] 邮件报表定时发送
- [ ] 移动端 APP 支持
