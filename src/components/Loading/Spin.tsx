import React from 'react';
import Loading, { LoadingProps } from './Loading';
import './loading.css';

// Spin 组件属性
export interface SpinProps extends Omit<LoadingProps, 'center'> {
  /** 是否处于加载状态 */
  spinning?: boolean;
  /** 加载指示符，可以自定义 */
  indicator?: React.ReactNode;
  /** 包裹的元素 */
  children?: React.ReactNode;
  /** 延迟显示加载效果的时间 (毫秒) */
  delay?: number;
  /** 描述文案 */
  tip?: string;
  /** 组件大小 */
  size?: 'small' | 'default' | 'large';
  /** 包装器的类名 */
  wrapperClassName?: string;
}

/**
 * Spin 加载组件 - 仿照 Ant Design
 */
export const Spin: React.FC<SpinProps> = ({
  spinning = true,
  indicator,
  children,
  delay = 0,
  tip,
  size = 'default',
  className = '',
  wrapperClassName = '',
  style,
  color = 'primary',
  type = 'spinner',
}) => {
  const [isSpinning, setIsSpinning] = React.useState(delay === 0 ? spinning : false);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsSpinning(spinning);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsSpinning(spinning);
    }
  }, [spinning, delay]);

  // 尺寸映射
  const sizeMap = {
    small: 'sm' as const,
    default: 'md' as const,
    large: 'lg' as const,
  };

  const loadingSize = sizeMap[size];

  // 渲染加载指示器
  const renderIndicator = () => {
    if (indicator) {
      return indicator;
    }

    return (
      <Loading
        type={type}
        size={loadingSize}
        color={color}
        className={className}
        style={style}
      />
    );
  };

  // 渲染加载内容
  const renderSpinContent = () => {
    const spinContent = (
      <div className="flex flex-col items-center justify-center gap-2">
        {renderIndicator()}
        {tip && (
          <div className="text-sm text-gray-600 mt-2">
            {tip}
          </div>
        )}
      </div>
    );

    return spinContent;
  };

  // 如果没有子元素，只显示加载器
  if (!children) {
    if (!isSpinning) return null;
    return (
      <div className={`inline-flex ${className}`} style={style}>
        {renderSpinContent()}
      </div>
    );
  }

  // 有子元素时，作为覆盖层显示
  const wrapperClasses = [
    'relative',
    wrapperClassName,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {children}
      {isSpinning && (
        <div className="loading-overlay">
          {renderSpinContent()}
        </div>
      )}
    </div>
  );
};

export default Spin;
