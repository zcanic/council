/**
 * Button Component - 重构版本
 * 
 * 设计原则：
 * 1. 更强的视觉层次和品牌表达
 * 2. 更细腻的交互状态反馈
 * 3. 更完整的无障碍访问支持
 * 4. 更灵活的组合使用方式
 */

import React from 'react';
import { cn } from '@/lib/utils';

// 按钮变体定义
type ButtonVariant = 
  | 'primary'      // 主要操作
  | 'secondary'    // 次要操作
  | 'outline'      // 边框按钮
  | 'ghost'        // 透明按钮
  | 'destructive'  // 危险操作
  | 'success'      // 成功状态
  | 'warning';     // 警告状态

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// 按钮样式映射
const buttonVariants = {
  primary: [
    'bg-gradient-to-r from-primary-600 to-primary-500',
    'text-white font-medium',
    'shadow-sm hover:shadow-md',
    'hover:from-primary-700 hover:to-primary-600',
    'active:from-primary-800 active:to-primary-700',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:from-neutral-300 disabled:to-neutral-300 disabled:text-neutral-500',
  ].join(' '),
  
  secondary: [
    'bg-gradient-to-r from-neutral-100 to-neutral-50',
    'text-neutral-900 font-medium',
    'border border-neutral-200',
    'shadow-sm hover:shadow-md',
    'hover:from-neutral-200 hover:to-neutral-100',
    'hover:border-neutral-300',
    'active:from-neutral-300 active:to-neutral-200',
    'focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2',
    'disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-200',
  ].join(' '),
  
  outline: [
    'bg-transparent',
    'text-primary-700 font-medium',
    'border-2 border-primary-300',
    'hover:bg-primary-50 hover:border-primary-400',
    'active:bg-primary-100',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:text-neutral-400 disabled:border-neutral-200',
  ].join(' '),
  
  ghost: [
    'bg-transparent',
    'text-neutral-700 font-medium',
    'hover:bg-neutral-100',
    'active:bg-neutral-200',
    'focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2',
    'disabled:text-neutral-400',
  ].join(' '),
  
  destructive: [
    'bg-gradient-to-r from-red-600 to-red-500',
    'text-white font-medium',
    'shadow-sm hover:shadow-md',
    'hover:from-red-700 hover:to-red-600',
    'active:from-red-800 active:to-red-700',
    'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
    'disabled:from-neutral-300 disabled:to-neutral-300 disabled:text-neutral-500',
  ].join(' '),
  
  success: [
    'bg-gradient-to-r from-success-600 to-success-500',
    'text-white font-medium',
    'shadow-sm hover:shadow-md',
    'hover:from-success-700 hover:to-success-600',
    'active:from-success-800 active:to-success-700',
    'focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2',
    'disabled:from-neutral-300 disabled:to-neutral-300 disabled:text-neutral-500',
  ].join(' '),
  
  warning: [
    'bg-gradient-to-r from-warning-600 to-warning-500',
    'text-white font-medium',
    'shadow-sm hover:shadow-md',
    'hover:from-warning-700 hover:to-warning-600',
    'active:from-warning-800 active:to-warning-700',
    'focus-visible:ring-2 focus-visible:ring-warning-500 focus-visible:ring-offset-2',
    'disabled:from-neutral-300 disabled:to-neutral-300 disabled:text-neutral-500',
  ].join(' ')
};

const buttonSizes = {
  xs: 'h-7 px-2.5 text-xs rounded-md gap-1',
  sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-6 text-base rounded-lg gap-2',
  xl: 'h-12 px-8 text-base rounded-xl gap-2.5'
};

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      className={cn(
        // 基础样式
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none',
        'disabled:pointer-events-none disabled:cursor-not-allowed',
        // 变体样式
        buttonVariants[variant],
        // 尺寸样式
        buttonSizes[size],
        // 全宽
        fullWidth && 'w-full',
        // 加载状态
        loading && 'relative text-transparent',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* 加载指示器 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="animate-spin h-4 w-4 text-current" 
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
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
      
      {/* 左侧图标 */}
      {leftIcon && !loading && (
        <span className="flex-shrink-0">
          {leftIcon}
        </span>
      )}
      
      {/* 按钮文本 */}
      <span className={cn(
        'flex-1',
        (leftIcon || rightIcon) && 'text-center'
      )}>
        {children}
      </span>
      
      {/* 右侧图标 */}
      {rightIcon && !loading && (
        <span className="flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
}

// 按钮组组件
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  orientation?: 'horizontal' | 'vertical';
  style?: 'attached' | 'separated'; // 新增样式选项
}

export function ButtonGroup({ 
  children, 
  className = '',
  size = 'md',
  variant = 'secondary',
  orientation = 'horizontal',
  style = 'separated'
}: ButtonGroupProps) {
  // 分离式按钮组 - 更现代，不拥挤
  if (style === 'separated') {
    return (
      <div 
        className={cn(
          'inline-flex',
          orientation === 'horizontal' ? 'flex-row gap-2' : 'flex-col gap-2',
          className
        )}
        role="group"
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Button) {
            return React.cloneElement(child, {
              size: child.props.size || size,
              variant: child.props.variant || variant,
            } as any);
          }
          return child;
        })}
      </div>
    );
  }
  
  // 连接式按钮组 - 传统风格，更紧凑
  return (
    <div 
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        // 使用更优雅的分隔线设计
        'gap-px bg-neutral-200 p-px rounded-lg overflow-hidden',
        // 按钮圆角处理
        '[&>button]:rounded-md',
        '[&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg',
        orientation === 'vertical' && '[&>button:first-child]:rounded-t-lg [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-b-lg [&>button:last-child]:rounded-r-md',
        // 移除按钮边框避免重叠
        '[&>button]:border-0 [&>button]:shadow-none',
        className
      )}
      role="group"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child, {
            size: child.props.size || size,
            variant: child.props.variant || variant,
          } as any);
        }
        return child;
      })}
    </div>
  );
}

// 图标按钮组件
interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export function IconButton({ 
  icon, 
  className = '',
  size = 'md',
  ...props 
}: IconButtonProps) {
  const sizeMap = {
    xs: 'h-7 w-7',
    sm: 'h-8 w-8', 
    md: 'h-10 w-10',
    lg: 'h-11 w-11',
    xl: 'h-12 w-12'
  };
  
  return (
    <Button
      className={cn(
        // 确保图标完美居中
        'p-0 aspect-square flex items-center justify-center',
        // 覆盖Button组件的默认间距
        '!px-0 !py-0',
        sizeMap[size],
        className
      )}
      size={size}
      {...props}
    >
      <span className="flex items-center justify-center w-full h-full">
        {icon}
      </span>
    </Button>
  );
}

// 悬浮操作按钮
interface FloatingActionButtonProps extends Omit<ButtonProps, 'size' | 'variant' | 'children'> {
  icon: React.ReactNode;
  size?: 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  icon,
  className = '',
  size = 'lg',
  position = 'bottom-right',
  ...props
}: FloatingActionButtonProps) {
  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };
  
  const sizeClasses = {
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };
  
  return (
    <Button
      className={cn(
        positions[position],
        sizeClasses[size],
        'rounded-full shadow-lg hover:shadow-xl z-50',
        'p-0 aspect-square',
        className
      )}
      variant="primary"
      {...props}
    >
      {icon}
    </Button>
  );
}
