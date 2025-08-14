'use client';

import { useState, useEffect } from 'react';
import { api, CreateCommentInput } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Send } from 'lucide-react';
import { SmartLoading, ActionFeedback } from '@/components/ui/SNSMicroInteractions';
import { optimisticManager } from '@/lib/optimistic-manager';

interface CommentFormProps {
  parentId: string;
  parentType: 'topic' | 'summary';
  onCommentAdded: (newComment?: any, isLastComment?: boolean) => void;
  currentCount: number;
  maxComments: number;
}

export default function CommentForm({ 
  parentId, 
  parentType, 
  onCommentAdded, 
  currentCount, 
  maxComments 
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedCount, setSubmittedCount] = useState(0);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // SNS级别的状态管理
  const effectiveCurrentCount = currentCount + submittedCount;
  const remainingSlots = maxComments - effectiveCurrentCount;
  const isLastSlot = remainingSlots === 1;

  // 当 currentCount 更新时重置 submittedCount，但延迟执行避免闪烁
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubmittedCount(0);
      setJustSubmitted(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentCount]);

  // SNS级别的乐观提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim().length < 1) {
      setError('评论内容不能为空');
      return;
    }

    setIsLoading(true);
    setError('');
    setActionStatus('loading');

    try {
      const input: CreateCommentInput = {
        content: content.trim(),
        author: author.trim() || undefined,
        parentId,
        parentType,
      };

      // 创建乐观更新数据
      const optimisticComment = {
        id: `optimistic_${Date.now()}`,
        content: input.content,
        author: input.author || '匿名',
        createdAt: new Date().toISOString(),
        topicId: parentType === 'topic' ? parentId : undefined,
        summaryId: parentType === 'summary' ? parentId : undefined,
        _optimistic: true,
        _action: 'create',
        _resource: 'comment'
      };

      // 使用SNS级别的乐观更新
      const newComment = await optimisticManager.optimisticUpdate(
        'create',
        'comment', 
        optimisticComment,
        () => api.createComment(input)
      );
      
      // 立即更新UI状态
      setContent('');
      setAuthor('');
      setSubmittedCount(prev => prev + 1);
      setJustSubmitted(true);
      setActionStatus('success');
      
      // 重置提交状态
      setTimeout(() => {
        setJustSubmitted(false);
        setActionStatus('idle');
      }, 3000);
      
      // 检查是否是第10条评论
      const isLastComment = (effectiveCurrentCount + 1) >= maxComments;
      
      // 立即回调通知父组件（使用乐观数据）
      onCommentAdded(optimisticComment, isLastComment);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '提交失败，请重试';
      setError(errorMessage);
      setActionStatus('error');
      
      // 自动清除错误状态
      setTimeout(() => setActionStatus('idle'), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (remainingSlots <= 0) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-6 text-center">
        <div className="mb-4">
          <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🤖</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-amber-800 mb-2">
          第10轮发言已完成！
        </h3>
        <p className="text-amber-700 mb-3">
          AI书记官正在提纯本轮讨论的智慧精华...
        </p>
        <div className="text-sm text-amber-600 bg-white bg-opacity-50 p-2 rounded">
          💎 即将生成新的智慧总结，开启下一轮更深层次的讨论
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 回环状态指示器 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium text-gray-800">
              第{Math.ceil(currentCount / 10)}轮议会 - 智慧汇聚中
            </span>
          </div>
          <div className="text-sm text-gray-600">
            还能发言 <span className="font-bold text-blue-600">{remainingSlots}</span> 次
            {justSubmitted && (
              <span className="ml-2 text-green-600 font-medium animate-pulse">
                ✅ 发言成功！
              </span>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((10 - remainingSlots) / 10) * 100}%` }}
          ></div>
        </div>
        {isLastSlot && (
          <div className="mt-3 text-center">
            <span className="text-red-600 font-medium text-sm bg-red-50 px-3 py-1 rounded-full">
              ⚡ 您的发言将触发AI智慧提纯！
            </span>
          </div>
        )}
      </div>

      {/* 发言表单 */}
      <div className="bg-white border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            🏛️ 议会发言台
          </h3>
          <p className="text-sm text-gray-600">
            {isLastSlot 
              ? '🎯 作为本轮最后发言者，您的观点将成为智慧提纯的关键'
              : '💭 每条评论都是民主议会的重要声音，请认真思考后发表'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="议员名称（可选）"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="匿名议员"
            maxLength={100}
            disabled={isLoading}
          />

          <Textarea
            label="您的议会发言"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`为第${Math.ceil(currentCount / 10)}轮议会贡献您的智慧洞察...`}
            rows={4}
            maxLength={10000}
            error={error}
            disabled={isLoading}
            required
          />

          <div className="flex justify-between items-center pt-2">
            <div className="text-xs text-gray-500">
              ⚖️ 议会期待您的真知灼见
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || content.trim().length < 1}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all"
            >
              <Send size={14} />
              {isLoading ? '发言中...' : '🗣️ 正式发言'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
