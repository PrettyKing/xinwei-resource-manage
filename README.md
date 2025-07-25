# 信维资源管理系统

基于 Next.js 和 MongoDB 的材料入库管理后台系统

## 功能特性

- 🔐 **完整的用户认证系统**
  - 用户注册与登录
  - JWT Token 认证
  - 角色权限管理 (admin/manager/operator)
  - 会话状态管理
- 📦 材料信息管理
- 📋 入库单管理
- 🏢 供应商管理
- 📊 库存统计与报表
- 📱 响应式设计

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **UI**: Ant Design, Tailwind CSS
- **数据库**: MongoDB, Mongoose
- **认证**: JWT, bcryptjs
- **状态管理**: React Context + useReducer

## 快速开始

### 环境要求

- Node.js 18+
- MongoDB 6+

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 修改 `.env` 文件中的配置：
```env
MONGODB_URI=mongodb://localhost:27017/xinwei-resource
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-here
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 用户认证系统

### 初始化系统

首次启动系统时，需要创建管理员账号：

1. 访问系统初始化接口：
```bash
curl -X POST http://localhost:3000/api/auth/init
```

2. 系统将创建默认管理员账号：
   - 用户名：`admin`
   - 密码：`123456`
   - 邮箱：`admin@xinwei.com`

### 角色权限

系统支持三种用户角色：

- **admin (系统管理员)**: 拥有所有权限
- **manager (管理员)**: 拥有业务管理权限
- **operator (操作员)**: 拥有基本操作权限

角色权限采用层级继承机制，高级角色自动拥有低级角色的所有权限。

### API 接口

#### 认证相关接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户退出
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/init` - 初始化管理员账号
- `GET /api/auth/init` - 获取系统初始化状态

#### 健康检查

- `GET /api/health` - 数据库连接状态检查

### 使用认证系统

#### 在组件中使用认证状态

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }
  
  return <div>欢迎, {user?.username}!</div>;
}
```

#### 权限保护组件

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>只有管理员能看到这个页面</div>
    </ProtectedRoute>
  );
}
```

#### 使用权限Hook

```tsx
import { usePermission } from '@/components/auth/ProtectedRoute';

function MyComponent() {
  const { hasPermission, user, role } = usePermission('manager');
  
  return (
    <div>
      {hasPermission ? (
        <button>管理员操作</button>
      ) : (
        <span>权限不足</span>
      )}
    </div>
  );
}
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/         # 认证相关 API
│   │   └── health/       # 健康检查 API
│   ├── dashboard/        # 仪表盘页面
│   ├── login/            # 登录页面
│   ├── layout.tsx        # 根布局
│   ├── page.tsx          # 首页重定向
│   └── globals.css       # 全局样式
├── components/            # React组件
│   ├── auth/             # 认证相关组件
│   └── layout/           # 布局组件
├── contexts/             # React Context
│   └── AuthContext.tsx  # 认证状态管理
├── lib/                  # 工具库
│   ├── auth.ts          # 认证工具函数
│   └── mongodb.ts       # MongoDB连接
├── models/               # 数据模型
│   ├── User.ts          # 用户模型
│   ├── Material.ts      # 材料模型
│   └── InboundOrder.ts  # 入库单模型
└── types/               # TypeScript 类型定义
```

## 数据库设计

### 用户表 (users)

```typescript
{
  username: string;        // 用户名
  email: string;          // 邮箱
  password: string;       // 加密密码
  role: 'admin' | 'manager' | 'operator';  // 角色
  isActive: boolean;      // 是否激活
  lastLogin?: Date;       // 最后登录时间
  createdAt: Date;        // 创建时间
  updatedAt: Date;        // 更新时间
}
```

### 材料表 (materials)

```typescript
{
  name: string;           // 材料名称
  code: string;          // 材料编码
  category: string;      // 分类
  specification: string; // 规格
  unit: string;          // 单位
  supplierId: ObjectId;  // 供应商ID
  supplierName: string;  // 供应商名称
  description?: string;  // 描述
  isActive: boolean;     // 是否启用
  createdAt: Date;       // 创建时间
  updatedAt: Date;       // 更新时间
}
```

### 入库单表 (inbound_orders)

```typescript
{
  orderNumber: string;    // 入库单号
  supplierId: ObjectId;   // 供应商ID
  supplierName: string;   // 供应商名称
  items: Array<{         // 入库明细
    materialId: ObjectId;
    materialName: string;
    materialCode: string;
    specification: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    batchNumber?: string;
    expiryDate?: Date;
    remarks?: string;
  }>;
  totalAmount: number;    // 总金额
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  operator: {            // 操作员信息
    id: ObjectId;
    name: string;
  };
  approver?: {           // 审批人信息
    id: ObjectId;
    name: string;
    approvedAt?: Date;
  };
  deliveryDate?: Date;   // 交货日期
  remarks?: string;      // 备注
  createdAt: Date;       // 创建时间
  updatedAt: Date;       // 更新时间
}
```

## 开发指南

### 添加新的API路由

1. 在 `src/app/api/` 目录下创建新的路由文件
2. 使用认证中间件保护需要权限的接口：

```typescript
import { authenticateUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await authenticateUser(request);
    
    // 业务逻辑
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '认证失败' },
      { status: 401 }
    );
  }
}
```

### 添加权限保护的页面

```tsx
import { withAuth } from '@/components/auth/ProtectedRoute';

function AdminPage() {
  return <div>管理员页面</div>;
}

export default withAuth(AdminPage, 'admin');
```

### 错误处理

系统提供了统一的错误处理机制：

- **401 Unauthorized**: 未认证或token无效
- **403 Forbidden**: 权限不足
- **409 Conflict**: 资源冲突（如用户已存在）
- **500 Internal Server Error**: 服务器内部错误

## 安全考虑

1. **密码安全**: 使用 bcryptjs 进行密码加密，盐值轮数为12
2. **JWT 安全**: Token 有效期为7天，存储在 HTTP-only Cookie 中
3. **输入验证**: 所有用户输入都经过严格验证
4. **权限控制**: 基于角色的访问控制，支持层级权限
5. **HTTPS**: 生产环境强制使用 HTTPS

## 部署

### 生产环境配置

1. 设置安全的环境变量：
```env
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-very-secure-jwt-secret
NEXTAUTH_SECRET=your-very-secure-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

2. 构建应用：
```bash
npm run build
```

3. 启动生产服务器：
```bash
npm start
```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 开发计划

### 已完成 ✅

- [x] 项目基础架构
- [x] 用户认证系统
- [x] 权限管理系统
- [x] 数据库模型设计
- [x] 基础UI布局

### 进行中 🚧

- [ ] 材料管理模块
- [ ] 供应商管理模块
- [ ] 入库管理模块

### 计划中 📋

- [ ] 库存统计模块
- [ ] 报表生成功能
- [ ] 数据导入导出
- [ ] 系统设置模块
- [ ] 操作日志记录
- [ ] 消息通知系统

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 常见问题

### Q: 忘记管理员密码怎么办？

A: 可以通过以下方式重置：

1. 直接修改数据库中的密码字段
2. 或者清空 users 集合，重新初始化系统

### Q: 如何修改默认的管理员账号？

A: 修改 `src/app/api/auth/init/route.ts` 文件中的默认配置。

### Q: 如何添加新的用户角色？

A: 
1. 修改 `src/models/User.ts` 中的角色枚举
2. 更新 `src/lib/auth.ts` 中的权限层级配置
3. 相应更新所有引用角色的地方

## 许可证

MIT License

## 技术支持

如有问题，请提交 Issue 或联系开发团队。
