import React from 'react';
import './loading.css';

// 骨架屏组件属性
export interface SkeletonProps {
  /** 是否显示动画 */
  active?: boolean;
  /** 是否显示头像 */
  avatar?: boolean | SkeletonAvatarProps;
  /** 是否显示标题 */
  title?: boolean | SkeletonTitleProps;
  /** 是否显示段落 */
  paragraph?: boolean | SkeletonParagraphProps;
  /** 是否处于加载状态 */
  loading?: boolean;
  /** 包裹的元素 */
  children?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 是否为暗色主题 */
  dark?: boolean;
}

// 头像骨架屏属性
export interface SkeletonAvatarProps {
  /** 头像大小 */
  size?: 'small' | 'default' | 'large' | number;
  /** 头像形状 */
  shape?: 'circle' | 'square';
}

// 标题骨架屏属性
export interface SkeletonTitleProps {
  /** 标题宽度 */
  width?: string | number;
}

// 段落骨架屏属性
export interface SkeletonParagraphProps {
  /** 段落行数 */
  rows?: number;
  /** 段落宽度 */
  width?: string | number | Array<string | number>;
}

/**
 * 骨架屏组件
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  active = true,
  avatar = false,
  title = true,
  paragraph = true,
  loading = true,
  children,
  className = '',
  dark = false,
}) => {
  // 如果不是加载状态且有子元素，直接显示子元素
  if (!loading && children) {
    return <>{children}</>;
  }

  const skeletonClass = dark ? 'loading-skeleton-dark' : 'loading-skeleton';
  const baseClasses = `${skeletonClass} ${className}`;

  // 渲染头像
  const renderAvatar = () => {
    if (!avatar) return null;

    const avatarProps = typeof avatar === 'object' ? avatar : {};
    const { size = 'default', shape = 'circle' } = avatarProps;

    let avatarSize: string;
    if (typeof size === 'number') {
      avatarSize = `${size}px`;
    } else {
      const sizeMap = {
        small: '24px',
        default: '32px',
        large: '40px',
      };
      avatarSize = sizeMap[size];
    }

    const avatarStyle: React.CSSProperties = {
      width: avatarSize,
      height: avatarSize,
      borderRadius: shape === 'circle' ? '50%' : '6px',
      flexShrink: 0,
    };

    return <div className={baseClasses} style={avatarStyle} />;
  };

  // 渲染标题
  const renderTitle = () => {
    if (!title) return null;

    const titleProps = typeof title === 'object' ? title : {};
    const { width = '60%' } = titleProps;

    const titleStyle: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: '16px',
      marginBottom: '8px',
    };

    return <div className={baseClasses} style={titleStyle} />;
  };

  // 渲染段落
  const renderParagraph = () => {
    if (!paragraph) return null;

    const paragraphProps = typeof paragraph === 'object' ? paragraph : {};
    const { rows = 3, width } = paragraphProps;

    const lines: React.ReactNode[] = [];

    for (let i = 0; i < rows; i++) {
      let lineWidth: string | number = '100%';

      if (width) {
        if (Array.isArray(width)) {
          lineWidth = width[i] || '100%';
        } else {
          lineWidth = width;
        }
      } else if (i === rows - 1) {
        // 最后一行默认较短
        lineWidth = '60%';
      }

      const lineStyle: React.CSSProperties = {
        width: typeof lineWidth === 'number' ? `${lineWidth}px` : lineWidth,
        height: '14px',
        marginBottom: i === rows - 1 ? 0 : '8px',
      };

      lines.push(
        <div key={i} className={baseClasses} style={lineStyle} />
      );
    }

    return <div>{lines}</div>;
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      {renderAvatar()}
      <div className="flex-1 min-w-0">
        {renderTitle()}
        {renderParagraph()}
      </div>
    </div>
  );
};

// 简单的图片骨架屏
export interface SkeletonImageProps {
  /** 图片宽度 */
  width?: string | number;
  /** 图片高度 */
  height?: string | number;
  /** 是否为暗色主题 */
  dark?: boolean;
  /** 自定义类名 */
  className?: string;
}

export const SkeletonImage: React.FC<SkeletonImageProps> = ({
  width = '100%',
  height = '200px',
  dark = false,
  className = '',
}) => {
  const skeletonClass = dark ? 'loading-skeleton-dark' : 'loading-skeleton';

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return <div className={`${skeletonClass} ${className}`} style={style} />;
};

// 简单的按钮骨架屏
export interface SkeletonButtonProps {
  /** 按钮大小 */
  size?: 'small' | 'default' | 'large';
  /** 按钮形状 */
  shape?: 'default' | 'round';
  /** 是否为暗色主题 */
  dark?: boolean;
  /** 自定义类名 */
  className?: string;
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  size = 'default',
  shape = 'default',
  dark = false,
  className = '',
}) => {
  const skeletonClass = dark ? 'loading-skeleton-dark' : 'loading-skeleton';

  const sizeMap = {
    small: { width: '60px', height: '24px' },
    default: { width: '80px', height: '32px' },
    large: { width: '100px', height: '40px' },
  };

  const style: React.CSSProperties = {
    ...sizeMap[size],
    borderRadius: shape === 'round' ? '16px' : '6px',
  };

  return <div className={`${skeletonClass} ${className}`} style={style} />;
};

export default Skeleton;
