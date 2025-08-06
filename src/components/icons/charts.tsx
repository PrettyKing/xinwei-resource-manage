import React from 'react';
import { IconProps } from './types';

// 趋势上升图标
export const TrendingUpIcon = ({ className = "", size = 16 }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

// 趋势上升图标（另一版本）
export const TrendUpIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline
      points="23,6 13.5,15.5 8.5,10.5 1,18"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <polyline
      points="17,6 23,6 23,12"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

// 趋势下降图标
export const TrendDownIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline
      points="23,18 13.5,8.5 8.5,13.5 1,6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <polyline
      points="17,18 23,18 23,12"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);