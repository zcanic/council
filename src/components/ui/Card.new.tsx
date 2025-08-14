/**
 * Card Component - 重构版本
 * 
 * 设计原则：
 * 1. 更细腻的交互反馈
 * 2. 更清晰的视觉层次
 * 3. 更强的语义化表达
 * 4. 更好的无障碍访问
 */

import React from 'react';
import { cn } from '@/lib/utils';

// 卡片变体定义
type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost' | 'interactive';
type CardSize = 'sm' | 'md' | 'lg' | 'xl';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  size?: CardSize;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  role?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

// 卡片样式映射
const cardVariants = {
  default: 'bg-surface-primary border border-border-light shadow-card',
  elevated: 'bg-surface-primary border-0 shadow-elevated',
  outlined: 'bg-surface-primary border-2 border-border-default shadow-none',
  ghost: 'bg-transparent border-0 shadow-none',
  interactive: 'bg-surface-primary border border-border-light shadow-card hover:shadow-card-hover hover:border-primary-300 cursor-pointer transition-all duration-200 hover:-translate-y-1'
};

const cardSizes = {
  sm: 'p-3 rounded-md',
  md: 'p-4 rounded-lg', 
  lg: 'p-6 rounded-xl',
  xl: 'p-8 rounded-2xl'
};

export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  role,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props 
}: CardProps) {
  const isInteractive = onClick && !disabled;
  const Component = isInteractive ? 'button' : 'div';
  
  return (
    <Component
      className={cn(
        // 基础样式
        'relative overflow-hidden transition-all duration-200',
        // 变体样式
        cardVariants[variant],
        // 尺寸样式
        cardSizes[size],
        // 交互状态
        isInteractive && 'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        // 禁用状态
        disabled && 'opacity-60 cursor-not-allowed',
        // 加载状态
        loading && 'pointer-events-none',
        className
      )}
      onClick={isInteractive ? onClick : undefined}
      disabled={disabled}
      role={role}
      aria-label={ariaLabel}
      data-testid={testId}
      {...props}
    >
      {/* 加载状态遮罩 */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* 交互状态指示器 */}
      {isInteractive && !disabled && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
      
      {children}
    </Component>
  );
}

// 卡片子组件
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={cn('pb-4 border-b border-border-light', className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export function CardContent({ children, className = '', padded = true }: CardContentProps) {
  return (
    <div className={cn(padded && 'pt-4', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={cn('pt-4 border-t border-border-light', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function CardTitle({ children, className = '', level = 3 }: CardTitleProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag className={cn(
      'font-semibold text-neutral-900 leading-tight',
      level === 1 && 'text-2xl',
      level === 2 && 'text-xl',
      level === 3 && 'text-lg',
      level === 4 && 'text-base',
      level === 5 && 'text-sm',
      level === 6 && 'text-xs',
      className
    )}>
      {children}
    </Tag>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={cn('text-body text-neutral-600 leading-relaxed', className)}>
      {children}
    </p>
  );
}

// 特殊的状态卡片组件
interface StatusCardProps extends Omit<CardProps, 'children'> {
  status: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export function StatusCard({ 
  status, 
  icon, 
  title, 
  description, 
  className = '',
  ...props 
}: StatusCardProps) {
  const statusColors = {
    success: 'border-success-200 bg-success-50 text-success-800',
    warning: 'border-warning-200 bg-warning-50 text-warning-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-primary-200 bg-primary-50 text-primary-800'
  };
  
  return (
    <Card 
      className={cn(
        'border-l-4',
        statusColors[status],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <CardTitle level={4} className="mb-1">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm opacity-90">
              {description}
            </CardDescription>
          )}
        </div>
      </div>
    </Card>
  );
}
