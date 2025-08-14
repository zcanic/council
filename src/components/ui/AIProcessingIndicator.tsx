'use client';

import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface AIProcessingIndicatorProps {
  topicId: string;
  isLocked: boolean;
  onComplete?: () => void;
  className?: string;
}

interface SummaryResponse {
  summaries: Array<{
    id: string;
    content: string;
    createdAt: string;
  }>;
}

/**
 * 🤖 AI处理状态指示器
 * 
 * 当话题被锁定后显示AI处理进度
 * 轮询检查总结完成状态并提供视觉反馈
 * 
 * @example
 * ```tsx
 * <AIProcessingIndicator 
 *   topicId="123" 
 *   isLocked={true}
 *   onComplete={() => console.log('AI处理完成')}
 * />
 * ```
 */
export function AIProcessingIndicator({ 
  topicId, 
  isLocked, 
  onComplete,
  className = ''
}: AIProcessingIndicatorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // 检查摘要完成状态
  const checkSummaryCompletion = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/topics/${topicId}/summaries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: SummaryResponse = await response.json();

      return Array.isArray(data.summaries) && data.summaries.length > 0;
    } catch (error) {
      console.error('Failed to check summary completion:', error);
      setHasError(true);

      return false;
    }
  }, [topicId]);

  // 处理完成逻辑
  const handleCompletion = useCallback(() => {
    setIsProcessing(false);
    setIsCompleted(true);
    onComplete?.();
    
    // 延迟刷新页面以显示新内容
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }, [onComplete]);

  // 主效果：管理处理状态和轮询
  useEffect(() => {
    if (!isLocked || isCompleted) return;

    setIsProcessing(true);
    setHasError(false);
    setProcessingTime(0);

    let pollInterval: NodeJS.Timeout;
    let timeInterval: NodeJS.Timeout;
    const startTime = Date.now();

    // 更新处理时间
    const updateTime = () => {
      setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
    };

    // 轮询摘要完成状态
    const pollSummary = async () => {
      const isCompleted = await checkSummaryCompletion();

      if (isCompleted) {
        handleCompletion();
        clearInterval(pollInterval);
        clearInterval(timeInterval);
      }
    };

    // 立即检查一次
    pollSummary();

    // 设置定时器
    pollInterval = setInterval(pollSummary, 3000); // 每3秒检查一次
    timeInterval = setInterval(updateTime, 1000);  // 每秒更新时间

    return () => {
      clearInterval(pollInterval);
      clearInterval(timeInterval);
    };
  }, [isLocked, isCompleted, checkSummaryCompletion, handleCompletion]);

  // 计算进度百分比（基于时间估算）
  const progressPercentage = Math.min((processingTime / 120) * 100, 95);

  // 不显示指示器的情况
  if (!isProcessing || (!isLocked && !isCompleted)) return null;

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm ${className}`}>
      {/* 完成状态 */}
      {isCompleted && (
        <div className="flex items-center space-x-3 text-green-700">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold">
              ✨ AI总结已完成！
            </h3>
            <p className="text-sm text-green-600 mt-1">
              页面即将刷新显示结果...
            </p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {hasError && !isCompleted && (
        <div className="flex items-center space-x-3 text-amber-700">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold">
              ⚠️ 检查状态时遇到问题
            </h3>
            <p className="text-sm text-amber-600 mt-1">
              AI仍在处理中，请稍后手动刷新页面
            </p>
          </div>
        </div>
      )}

      {/* 处理中状态 */}
      {!isCompleted && !hasError && (
        <>
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900">
                🤖 AI正在分析讨论内容...
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                已处理 {processingTime} 秒，预计还需 {Math.max(120 - processingTime, 10)} 秒完成
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-4">
            <div className="bg-blue-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* 提示信息 */}
          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <p className="text-xs text-blue-600 flex items-center">
              <span className="mr-2">💡</span>
              AI正在深度理解讨论内容，生成高质量摘要。完成后页面将自动刷新。
            </p>
          </div>
        </>
      )}
    </div>
  );
}
