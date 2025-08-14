'use client';

import { MessageCircle, Lock, Clock, ArrowLeft } from 'lucide-react';

import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TopicWithRelations, Summary } from '@/lib/api';

interface TopicHeaderProps {
  topic: TopicWithRelations;
  currentSummary?: Summary;
  onBack: () => void;
  onTopicClick?: () => void;
}

export default function TopicHeader({ 
  topic, 
  currentSummary, 
  onBack, 
  onTopicClick 
}: TopicHeaderProps) {
  const isLocked = topic.status === 'locked';
  const totalComments = topic.comments.length;
  const summaryCount = topic.summaries.length;
  
  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          返回大厅
        </Button>
        
        {currentSummary && (
          <Button 
            variant="outline" 
            onClick={onTopicClick}
            className="flex items-center gap-2 text-sm"
          >
            查看原议题
          </Button>
        )}
      </div>

      {/* Topic Card */}
      <Card className={`${isLocked ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl text-gray-900">
              {currentSummary ? (
                <>
                  <span className="text-purple-600">【AI总结讨论】</span>
                  <div className="text-base font-normal text-gray-600 mt-1">
                    来自议题：{topic.title}
                  </div>
                </>
              ) : (
                topic.title
              )}
            </CardTitle>
            
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${isLocked 
                ? 'bg-amber-100 text-amber-700 border border-amber-300' 
                : 'bg-green-100 text-green-700 border border-green-300'
              }
            `}>
              {isLocked ? '已锁定' : '讨论中'}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MessageCircle size={14} />
              <span>评论: {totalComments}</span>
            </div>
            
            {summaryCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-purple-600">总结: {summaryCount}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>创建于 {new Date(topic.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
          
          {!currentSummary && summaryCount > 0 && (
            <div className="mt-3 text-sm text-purple-600 bg-purple-50 p-2 rounded border">
              💡 此议题已生成 {summaryCount} 轮AI总结，讨论正在不断深化
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
