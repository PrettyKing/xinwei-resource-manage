import React from 'react';
import './loading.css';

// 加载动画类型
export type LoadingType = 'spinner' | 'dots' | 'wave' | 'circle' | 'pulse';
export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoadingColor = 'primary' | 'success' | 'warning' | 'error' | 'white' | 'gray';

// 基础Loading组件属性
export interface LoadingProps {
  type?: LoadingType;
  size?: LoadingSize;
  color?: LoadingColor;
  className?: string;
  style?: React.CSSProperties;
}

// 简化的Loading组件（内联到此文件）
const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  className = '',
  style,
}) => {
  const getSpinnerContent = () => {
    switch (type) {
      case 'spinner':
        return (
          <svg
            className={`animate-spin loading-spinner loading-${size} loading-${color} ${className}`}
            style={style}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case 'dots':
        return (
          <div className={`loading-dots loading-${size} loading-${color} ${className}`} style={style}>
            <div />
            <div />
            <div />
          </div>
        );
      default:
        return getSpinnerContent();
    }
  };

  return getSpinnerContent();
};

// 页面加载组件属性
export interface PageLoadingProps extends Omit<LoadingProps, 'center'> {
  /** 是否显示 */
  visible?: boolean;
  /** 描述文案 */
  tip?: string;
  /** 是否为暗色主题 */
  dark?: boolean;
  /** 背景遮罩透明度 */
  maskOpacity?: number;
  /** 点击遮罩是否可关闭 */
  maskClosable?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** z-index 层级 */
  zIndex?: number;
}

/**
 * 页面级加载组件
 */
export const PageLoading: React.FC<PageLoadingProps> = ({
  visible = true,
  tip,
  dark = false,
  maskOpacity,
  maskClosable = false,
  onClose,
  zIndex = 9999,
  type = 'spinner',
  size = 'lg',
  color = 'primary',
  className = '',
  style,
}) => {
  const handleMaskClick = () => {
    if (maskClosable && onClose) {
      onClose();
    }
  };

  if (!visible) return null;

  const overlayClasses = [
    'loading-page',
    dark ? 'loading-page-dark' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const overlayStyles: React.CSSProperties = {
    backgroundColor: maskOpacity !== undefined 
      ? `rgba(0, 0, 0, ${maskOpacity})` 
      : undefined,
    zIndex,
    ...style,
  };

  return (
    <div
      className={overlayClasses}
      style={overlayStyles}
      onClick={handleMaskClick}
    >
      <div className="loading-content" onClick={(e) => e.stopPropagation()}>
        <Loading type={type} size={size} color={color} />
        {tip && <div className="loading-tip">{tip}</div>}
      </div>
    </div>
  );
};

// 局部加载组件属性
export interface LocalLoadingProps extends LoadingProps {
  /** 是否显示加载 */
  spinning?: boolean;
  /** 描述文案 */
  tip?: string;
  /** 最小高度 */
  minHeight?: number | string;
  /** 延迟显示加载的时间 (ms) */
  delay?: number;
  /** 是否为暗色主题 */
  dark?: boolean;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * 局部加载组件
 */
export const LocalLoading: React.FC<LocalLoadingProps> = ({
  spinning = false,
  tip,
  minHeight = 120,
  delay = 0,
  dark = false,
  children,
  type = 'spinner',
  size = 'md',
  color = 'primary',
  className = '',
  style,
}) => {
  const [showLoading, setShowLoading] = React.useState(spinning && delay === 0);

  React.useEffect(() => {
    if (spinning && delay > 0) {
      const timer = setTimeout(() => setShowLoading(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(spinning);
    }
  }, [spinning, delay]);

  const containerClasses = [
    'loading-local',
    dark ? 'loading-local-dark' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyles: React.CSSProperties = {
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
    ...style,
  };

  return (
    <div className={containerClasses} style={containerStyles}>
      {showLoading && (
        <div className="loading-mask">
          <div className="loading-content">
            <Loading type={type} size={size} color={color} />
            {tip && <div className="loading-tip">{tip}</div>}
          </div>
        </div>
      )}
      <div className={showLoading ? 'loading-blur' : ''}>{children}</div>
    </div>
  );
};

// 按钮加载组件属性
export interface ButtonLoadingProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 是否加载中 */
  loading?: boolean;
  /** 加载时的文案 */
  loadingText?: string;
  /** 加载图标类型 */
  loadingType?: LoadingType;
  /** 加载图标大小 */
  loadingSize?: LoadingSize;
  /** 是否禁用 */
  disabled?: boolean;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * 按钮加载组件
 */
export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading = false,
  loadingText,
  loadingType = 'spinner',
  loadingSize = 'sm',
  disabled,
  className = '',
  children,
  ...buttonProps
}) => {
  const isDisabled = disabled || loading;
  
  const buttonClasses = [
    'loading-button',
    loading ? 'loading-button-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...buttonProps}
      disabled={isDisabled}
      className={buttonClasses}
    >
      {loading && (
        <Loading 
          type={loadingType} 
          size={loadingSize} 
          color="white"
          className="loading-button-spinner"
        />
      )}
      <span className={loading ? 'loading-button-text' : ''}>
        {loading && loadingText ? loadingText : children}
      </span>
    </button>
  );
};

export default PageLoading;