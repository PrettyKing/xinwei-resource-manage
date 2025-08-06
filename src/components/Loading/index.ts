// Loading 组件库统一导出

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