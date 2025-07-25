# Loading 组件库

仿照 Ant Design 的 Loading 组件库，提供多种加载状态和动画效果。

## 📦 组件列表

- **Loading** - 基础加载组件
- **Spin** - 旋转加载组件（仿 Ant Design）
- **Skeleton** - 骨架屏组件
- **PageLoading** - 页面级加载
- **LocalLoading** - 局部加载
- **ButtonLoading** - 按钮加载

## 🎨 特性

- ✨ **多种动画效果** - spinner、dots、wave、circle、pulse
- 🎯 **灵活配置** - 支持不同尺寸、颜色、主题
- 📱 **响应式设计** - 适配各种屏幕尺寸
- ♿ **无障碍支持** - 支持减少动画偏好设置
- 🎨 **样式分离** - CSS 文件独立，易于定制
- 📚 **TypeScript** - 完整的类型定义

## 🚀 快速开始

### 基础 Loading

```tsx
import { Loading } from '@/components/Loading';

// 基础用法
<Loading />

// 自定义配置
<Loading 
  type="dots" 
  size="lg" 
  color="primary" 
  text="加载中..." 
/>
```

### Spin 组件

```tsx
import { Spin } from '@/components/Loading';

// 包装内容
<Spin spinning={loading} tip="正在加载数据...">
  <div className="h-40 bg-gray-100 rounded">
    <p>这里是内容区域</p>
  </div>
</Spin>

// 延迟显示
<Spin spinning={loading} delay={500}>
  <div>内容</div>
</Spin>

// 自定义指示器
<Spin 
  spinning={loading}
  indicator={<Loading type="pulse" color="success" />}
>
  <div>内容</div>
</Spin>
```

### 骨架屏

```tsx
import { Skeleton, SkeletonImage, SkeletonButton } from '@/components/Loading';

// 标准骨架屏
<Skeleton 
  avatar 
  paragraph={{ rows: 4 }} 
  loading={loading}
>
  <div>
    <h3>文章标题</h3>
    <p>文章内容...</p>
  </div>
</Skeleton>

// 图片骨架屏
<SkeletonImage width={200} height={150} />

// 按钮骨架屏
<SkeletonButton size="large" shape="round" />
```

### 页面加载

```tsx
import { PageLoading } from '@/components/Loading';

// 全屏加载
<PageLoading 
  visible={loading}
  tip="正在初始化应用..."
  type="spinner"
  size="lg"
/>

// 可关闭的加载
<PageLoading 
  visible={loading}
  maskClosable
  onClose={() => setLoading(false)}
/>
```

### 局部加载

```tsx
import { LocalLoading } from '@/components/Loading';

// 包装区域加载
<LocalLoading 
  spinning={loading}
  tip="数据加载中..."
  minHeight={300}
>
  <div className="p-4">
    <h3>数据表格</h3>
    <table>...</table>
  </div>
</LocalLoading>
```

### 按钮加载

```tsx
import { ButtonLoading } from '@/components/Loading';

// 提交按钮
<ButtonLoading 
  loading={submitting}
  loadingText="提交中..."
  onClick={handleSubmit}
  size="large"
>
  提交表单
</ButtonLoading>
```

## 🎯 API 参考

### Loading Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'spinner' \| 'dots' \| 'wave' \| 'circle' \| 'pulse'` | `'spinner'` | 加载动画类型 |
| size | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 组件大小 |
| color | `'primary' \| 'success' \| 'warning' \| 'error' \| 'white' \| 'gray'` | `'primary'` | 颜色主题 |
| text | `string` | - | 显示的文本 |
| center | `boolean` | `false` | 是否居中显示 |
| className | `string` | - | 自定义类名 |
| style | `CSSProperties` | - | 自定义样式 |

### Spin Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| spinning | `boolean` | `true` | 是否为加载中状态 |
| indicator | `ReactNode` | - | 自定义加载指示符 |
| delay | `number` | `0` | 延迟显示加载效果的时间(ms) |
| tip | `string` | - | 当作为包裹元素时，可以自定义描述文案 |
| size | `'small' \| 'default' \| 'large'` | `'default'` | 组件大小 |
| wrapperClassName | `string` | - | 包装器的类名 |

### Skeleton Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| active | `boolean` | `true` | 是否展示动画效果 |
| avatar | `boolean \| SkeletonAvatarProps` | `false` | 是否显示头像占位图 |
| title | `boolean \| SkeletonTitleProps` | `true` | 是否显示标题占位图 |
| paragraph | `boolean \| SkeletonParagraphProps` | `true` | 是否显示段落占位图 |
| loading | `boolean` | `true` | 为 true 时，显示占位图。反之则直接展示子组件 |
| dark | `boolean` | `false` | 是否为暗色主题 |

## 🎨 样式定制

### CSS 变量

```css
:root {
  --loading-primary-color: #1890ff;
  --loading-success-color: #52c41a;
  --loading-warning-color: #faad14;
  --loading-error-color: #ff4d4f;
  --loading-duration: 1s;
  --loading-timing-function: linear;
}
```

### 自定义主题

```css
/* 自定义颜色 */
.custom-loading {
  color: #your-color;
}

/* 自定义动画速度 */
.slow-loading .loading-spinner {
  animation-duration: 2s;
}

/* 暗色主题覆盖 */
.dark .loading-overlay {
  background-color: rgba(0, 0, 0, 0.8);
}
```

## 📱 响应式设计

组件支持响应式设计，在移动端会自动调整：

- 文字大小自适应
- 间距优化
- 触摸友好的交互区域

## ♿ 无障碍支持

- 支持 `prefers-reduced-motion` 媒体查询
- 语义化的 HTML 结构
- 合适的 ARIA 属性
- 键盘导航支持

## 🌟 最佳实践

### 1. 合理的延迟时间

```tsx
// 避免闪烁，设置合理的延迟
<Spin spinning={loading} delay={200}>
  <Content />
</Spin>
```

### 2. 有意义的提示文案

```tsx
// 提供有意义的加载提示
<PageLoading 
  visible={loading}
  tip="正在加载用户数据，请稍候..."
/>
```

### 3. 适当的骨架屏

```tsx
// 骨架屏应该匹配实际内容结构
<Skeleton 
  avatar={{ size: 'large' }}
  paragraph={{ rows: 3, width: ['100%', '80%', '60%'] }}
  loading={loading}
>
  <UserCard />
</Skeleton>
```

### 4. 错误状态处理

```tsx
// 结合错误状态使用
{error ? (
  <div className="text-center text-red-500">
    加载失败，请重试
  </div>
) : (
  <LocalLoading spinning={loading}>
    <DataTable />
  </LocalLoading>
)}
```

## 🔧 开发说明

### 文件结构

```
src/components/Loading/
├── loading.css          # 样式文件
├── Loading.tsx          # 基础加载组件
├── Spin.tsx            # Spin 组件
├── Skeleton.tsx        # 骨架屏组件
├── PageLoading.tsx     # 页面级加载组件
├── index.ts            # 统一导出
└── README.md           # 文档
```

### 样式组织

- 使用 CSS 类而非内联样式
- 支持主题切换
- 响应式设计
- 无障碍友好

### 性能优化

- 按需导入
- CSS 动画优化
- 减少重绘重排
- 内存泄漏预防
