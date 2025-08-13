'use client';

import { useState, useEffect } from 'react';

interface AIProcessingIndicatorProps {
  topicId: string;
  isLocked: boolean;
}

/**
 * Component that shows AI processing status after a topic is locked
 * Polls for summary completion and shows progress indicator
 */
export function AIProcessingIndicator({ topicId, isLocked }: AIProcessingIndicatorProps) {
  const [isProcessing, setIsProcessing] = useState(isLocked);
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    if (!isLocked) return;

    let interval: NodeJS.Timeout;
    let startTime = Date.now();

    // Poll for summary completion
    const checkForSummary = async () => {
      try {
        const response = await fetch(`/api/topics/${topicId}/summaries`);
        const summaries = await response.json();
        
        if (summaries && summaries.length > 0) {
          // Summary is ready
          setIsProcessing(false);
          if (interval) clearInterval(interval);
          // Trigger page refresh to show the summary
          window.location.reload();
        }
      } catch (error) {
        console.error('Error checking for summaries:', error);
      }
    };

    // Update processing time display
    const updateTime = () => {
      setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
    };

    if (isProcessing) {
      // Check for summary every 5 seconds
      interval = setInterval(checkForSummary, 5000);
      
      // Update time display every second
      const timeInterval = setInterval(updateTime, 1000);
      
      // Initial check
      checkForSummary();

      return () => {
        clearInterval(interval);
        clearInterval(timeInterval);
      };
    }
  }, [topicId, isLocked]);

  if (!isProcessing) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900">
            🤖 AI正在生成讨论总结...
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            已处理 {processingTime} 秒，预计还需 1-2 分钟完成
          </p>
        </div>
      </div>
      <div className="mt-3">
        <div className="bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((processingTime / 120) * 100, 90)}%` }}
          ></div>
        </div>
      </div>
      <p className="text-xs text-blue-600 mt-2">
        💡 提示：AI总结完成后页面会自动刷新显示结果
      </p>
    </div>
  );
}
