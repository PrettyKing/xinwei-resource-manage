import React from 'react';
import './loading.css';

// 加载类型
export type LoadingType = 'spinner' | 'dots' | 'wave' | 'circle' | 'pulse';

// 尺寸类型
export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 颜色类型
export type LoadingColor = 'primary' | 'success' | 'warning' | 'error' | 'white' | 'gray';

// Loading 组件属性
export interface LoadingProps {
  /** 加载类型 */
  type?: LoadingType;
  /** 尺寸 */
  size?: LoadingSize;
  /** 颜色 */
  color?: LoadingColor;
  /** 自定义类名 */
  className?: string;
  /** 是否显示文本 */
  text?: string;
  /** 是否居中显示 */
  center?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 基础 Loading 组件
 */
export const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  className = '',
  text,
  center = false,
  style,
}) => {
  const baseClasses = [
    `loading-${size}`,
    `loading-${color}`,
    className,
  ].filter(Boolean).join(' ');

  const containerClasses = [
    text ? 'loading-text' : '',
    center ? 'flex justify-center items-center' : '',
    color === 'primary' && text ? 'loading-text-primary' : '',
  ].filter(Boolean).join(' ');

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={`loading-dots ${baseClasses}`}>
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        );

      case 'wave':
        return (
          <div className={`loading-wave ${baseClasses}`}>
            <div className="loading-wave-bar" />
            <div className="loading-wave-bar" />
            <div className="loading-wave-bar" />
            <div className="loading-wave-bar" />
            <div className="loading-wave-bar" />
          </div>
        );

      case 'circle':
        return <div className={`loading-circle ${baseClasses}`} style={style} />;

      case 'pulse':
        return <div className={`loading-pulse ${baseClasses}`} style={style} />;

      case 'spinner':
      default:
        return <div className={`loading-spinner ${baseClasses}`} style={style} />;
    }
  };

  if (text) {
    return (
      <div className={containerClasses} style={style}>
        {renderLoader()}
        <span>{text}</span>
      </div>
    );
  }

  return renderLoader();
};

export default Loading;
