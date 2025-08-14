// SNS级别的微交互组件
// 提供Twitter/Instagram级别的用户体验

import React, { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';

// 智能Loading状态组件
interface SmartLoadingProps {
  isLoading: boolean;
  hasError: boolean;
  isOptimistic: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SmartLoading({
  isLoading,
  hasError,
  isOptimistic,
  children,
  className
}: SmartLoadingProps) {
  return (
    <div className={cn(
      'relative transition-all duration-200',
      {
        'opacity-60': isLoading,
        'opacity-50 animate-pulse': isOptimistic,
        'opacity-30 grayscale': hasError,
      },
      className
    )}>
      {children}
      
      {/* 乐观更新指示器 */}
      {isOptimistic && (
        <div className="absolute -top-1 -right-1 w-2 h-2">
          <div className="w-full h-full bg-blue-400 rounded-full animate-ping opacity-75" />
          <div className="absolute inset-0 w-full h-full bg-blue-500 rounded-full" />
        </div>
      )}
      
      {/* 错误指示器 */}
      {hasError && (
        <div className="absolute -top-1 -right-1 w-2 h-2">
          <div className="w-full h-full bg-red-500 rounded-full animate-bounce" />
        </div>
      )}
    </div>
  );
}

// 渐进式内容显示
interface ProgressiveContentProps {
  show: boolean;
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  delay?: number;
  className?: string;
}

export function ProgressiveContent({
  show,
  children,
  animation = 'fade',
  delay = 0,
  className
}: ProgressiveContentProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), delay);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);

      return () => clearTimeout(timer);
    }
  }, [show, delay]);

  if (!shouldRender) return null;

  const animations = {
    fade: isVisible ? 'opacity-100' : 'opacity-0',
    slide: isVisible 
      ? 'opacity-100 transform translate-y-0' 
      : 'opacity-0 transform translate-y-4',
    scale: isVisible 
      ? 'opacity-100 transform scale-100' 
      : 'opacity-0 transform scale-95'
  };

  return (
    <div className={cn(
      'transition-all duration-300 ease-out',
      animations[animation],
      className
    )}>
      {children}
    </div>
  );
}

// SNS风格的操作反馈
interface ActionFeedbackProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  successMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export function ActionFeedback({
  status,
  successMessage = '操作成功',
  errorMessage = '操作失败',
  onRetry
}: ActionFeedbackProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);

      return () => {}; // 返回空清理函数
    }
  }, [status]);

  return (
    <ProgressiveContent show={show} animation="slide">
      <div className={cn(
        'fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg z-50',
        'flex items-center gap-3',
        {
          'bg-green-500 text-white': status === 'success',
          'bg-red-500 text-white': status === 'error',
        }
      )}>
        <div className="flex-1">
          {status === 'success' && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              {successMessage}
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-xs">!</span>
                </div>
                {errorMessage}
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm underline hover:no-underline transition-colors"
                >
                  重试
                </button>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShow(false)}
          className="text-white hover:text-opacity-70 transition-colors"
        >
          <span className="sr-only">关闭</span>
          ×
        </button>
      </div>
    </ProgressiveContent>
  );
}

// 实时状态指示器
interface RealtimeIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date;
  className?: string;
}

export function RealtimeIndicator({
  isConnected,
  lastUpdate,
  className
}: RealtimeIndicatorProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div 
      className={cn('flex items-center gap-2 text-xs', className)}
      onMouseEnter={() => setShowDetail(true)}
      onMouseLeave={() => setShowDetail(false)}
    >
      <div className={cn(
        'w-2 h-2 rounded-full transition-colors',
        isConnected ? 'bg-green-400' : 'bg-red-400'
      )} />
      
      <ProgressiveContent show={showDetail} animation="fade">
        <span className="text-gray-500">
          {isConnected ? '实时同步' : '连接中断'}
          {lastUpdate && (
            <>
              <br />
              最后更新: {lastUpdate.toLocaleTimeString()}
            </>
          )}
        </span>
      </ProgressiveContent>
    </div>
  );
}

// 骨架屏组件
interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export function Skeleton({ className, lines = 3, avatar = false }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex items-start space-x-4">
        {avatar && (
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        )}
        <div className="flex-1 space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 bg-gray-200 rounded',
                i === lines - 1 ? 'w-3/4' : 'w-full'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 内容占位符
interface ContentPlaceholderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ContentPlaceholder({
  icon,
  title,
  description,
  action,
  className
}: ContentPlaceholderProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action}
    </div>
  );
}
