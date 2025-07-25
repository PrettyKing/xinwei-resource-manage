import React from 'react';
import Loading, { LoadingProps } from './Loading';
import './loading.css';

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
  ].filter(Boolean).join(' ');

  const overlayStyle: React.CSSProperties = {
    zIndex,
    ...(maskOpacity !== undefined && {
      backgroundColor: dark 
        ? `rgba(0, 0, 0, ${maskOpacity})` 
        : `rgba(255, 255, 255, ${maskOpacity})`,
    }),
    ...style,
  };

  return (
    <div 
      className={overlayClasses}
      style={overlayStyle}
      onClick={handleMaskClick}
    >
      <div 
        className="flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Loading
          type={type}
          size={size}
          color={color}
        />
        {tip && (
          <div className={`text-center ${dark ? 'text-white' : 'text-gray-600'}`}>
            {tip}
          </div>
        )}
      </div>
    </div>
  );
};

// 局部加载组件
export interface LocalLoadingProps extends Omit<LoadingProps, 'center'> {
  /** 是否显示 */
  spinning?: boolean;
  /** 包裹的元素 */
  children?: React.ReactNode;
  /** 描述文案 */
  tip?: string;
  /** 是否为暗色主题 */
  dark?: boolean;
  /** 容器类名 */
  wrapperClassName?: string;
  /** 最小高度 */
  minHeight?: string | number;
}

/**
 * 局部加载组件
 */
export const LocalLoading: React.FC<LocalLoadingProps> = ({
  spinning = true,
  children,
  tip,
  dark = false,
  wrapperClassName = '',
  minHeight,
  type = 'spinner',
  size = 'md',
  color = 'primary',
  className = '',
  style,
}) => {
  const wrapperClasses = [
    'relative',
    wrapperClassName,
  ].filter(Boolean).join(' ');

  const wrapperStyle: React.CSSProperties = {
    ...(minHeight && {
      minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
    }),
  };

  const overlayClasses = [
    'loading-overlay',
    dark ? 'loading-overlay-dark' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses} style={wrapperStyle}>
      {children}
      {spinning && (
        <div className={overlayClasses}>
          <div className="flex flex-col items-center gap-3">
            <Loading
              type={type}
              size={size}
              color={color}
              className={className}
              style={style}
            />
            {tip && (
              <div className={`text-sm ${dark ? 'text-white' : 'text-gray-600'}`}>
                {tip}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 按钮加载组件
export interface ButtonLoadingProps {
  /** 是否显示加载 */
  loading?: boolean;
  /** 加载文案 */
  loadingText?: string;
  /** 按钮内容 */
  children?: React.ReactNode;
  /** 按钮类型 */
  type?: 'button' | 'submit' | 'reset';
  /** 点击事件 */
  onClick?: () => void;
  /** 按钮是否禁用 */
  disabled?: boolean;
  /** 按钮大小 */
  size?: 'small' | 'default' | 'large';
  /** 按钮样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 带加载状态的按钮组件
 */
export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading = false,
  loadingText,
  children,
  type = 'button',
  onClick,
  disabled = false,
  size = 'default',
  className = '',
  style,
}) => {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  };

  const buttonClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-lg',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'bg-blue-600 hover:bg-blue-700 text-white',
    'focus:ring-blue-500',
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  const isDisabled = loading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={buttonClasses}
      style={style}
    >
      {loading && (
        <Loading
          type="spinner"
          size="xs"
          color="white"
          className="mr-2"
        />
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
};

export default PageLoading;
