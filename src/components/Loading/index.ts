// Loading 组件库统一导出

// 基础组件
export { default as Loading } from './Loading';
export type { LoadingProps, LoadingType, LoadingSize, LoadingColor } from './Loading';

// Spin 组件（仿 Ant Design）
export { default as Spin } from './Spin';
export type { SpinProps } from './Spin';

// 骨架屏组件
export { 
  default as Skeleton, 
  SkeletonImage, 
  SkeletonButton 
} from './Skeleton';
export type { 
  SkeletonProps, 
  SkeletonAvatarProps, 
  SkeletonTitleProps, 
  SkeletonParagraphProps,
  SkeletonImageProps,
  SkeletonButtonProps
} from './Skeleton';

// 页面加载组件
export { 
  default as PageLoading, 
  LocalLoading, 
  ButtonLoading 
} from './PageLoading';
export type { 
  PageLoadingProps, 
  LocalLoadingProps, 
  ButtonLoadingProps 
} from './PageLoading';

// 样式文件
import './loading.css';

// 便捷的工具函数
export const createLoading = (config: {
  type?: 'spinner' | 'dots' | 'wave' | 'circle' | 'pulse';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'white' | 'gray';
}) => {
  const { type = 'spinner', size = 'md', color = 'primary' } = config;
  
  return {
    type,
    size,
    color,
  };
};

// 预设配置
export const LoadingPresets = {
  // 按钮加载
  button: createLoading({ type: 'spinner', size: 'sm', color: 'white' }),
  
  // 页面加载
  page: createLoading({ type: 'spinner', size: 'lg', color: 'primary' }),
  
  // 卡片加载
  card: createLoading({ type: 'spinner', size: 'md', color: 'primary' }),
  
  // 表格加载
  table: createLoading({ type: 'dots', size: 'md', color: 'primary' }),
  
  // 图片加载
  image: createLoading({ type: 'circle', size: 'md', color: 'gray' }),
  
  // 文本加载
  text: createLoading({ type: 'wave', size: 'sm', color: 'gray' }),
  
  // 成功状态
  success: createLoading({ type: 'spinner', size: 'md', color: 'success' }),
  
  // 错误状态
  error: createLoading({ type: 'spinner', size: 'md', color: 'error' }),
  
  // 警告状态
  warning: createLoading({ type: 'spinner', size: 'md', color: 'warning' }),
};

// 使用示例和文档
export const LoadingExamples = {
  // 基础用法
  basic: `
import { Loading } from '@/components/Loading';

<Loading type="spinner" size="md" color="primary" />
  `,
  
  // Spin 用法
  spin: `
import { Spin } from '@/components/Loading';

<Spin spinning={loading} tip="加载中...">
  <div>内容区域</div>
</Spin>
  `,
  
  // 骨架屏用法
  skeleton: `
import { Skeleton } from '@/components/Loading';

<Skeleton 
  avatar 
  paragraph={{ rows: 4 }} 
  loading={loading}
>
  <div>实际内容</div>
</Skeleton>
  `,
  
  // 页面加载用法
  pageLoading: `
import { PageLoading } from '@/components/Loading';

<PageLoading 
  visible={loading} 
  tip="正在加载数据..." 
  type="spinner"
/>
  `,
  
  // 局部加载用法
  localLoading: `
import { LocalLoading } from '@/components/Loading';

<LocalLoading 
  spinning={loading} 
  tip="加载中..."
  minHeight={200}
>
  <div>内容区域</div>
</LocalLoading>
  `,
  
  // 按钮加载用法
  buttonLoading: `
import { ButtonLoading } from '@/components/Loading';

<ButtonLoading 
  loading={submitting}
  loadingText="提交中..."
  onClick={handleSubmit}
>
  提交
</ButtonLoading>
  `,
};
