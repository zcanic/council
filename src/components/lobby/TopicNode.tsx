'use client';

import { Topic } from '@/lib/api';
import Card, { CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { MessageCircle, Lock, Clock } from 'lucide-react';

interface TopicNodeProps {
  topic: Topic;
  commentCount?: number;
  summaryCount?: number;
  onClick: () => void;
}

export default function TopicNode({ topic, commentCount = 0, summaryCount = 0, onClick }: TopicNodeProps) {
  const isLocked = topic.status === 'locked';
  const discussionDepth = summaryCount;
  
  return (
    <Card 
      onClick={onClick}
      className={`
        relative min-h-[120px] transition-all duration-300 hover:scale-105 cursor-pointer
        ${isLocked ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50 hover:bg-blue-100'}
      `}
    >
      <CardContent>
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <CardTitle className="text-base mb-2 line-clamp-2">
              {topic.title}
            </CardTitle>
            
            <CardDescription className="text-xs mb-3">
              创建于 {new Date(topic.createdAt).toLocaleDateString('zh-CN')}
            </CardDescription>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <MessageCircle size={12} />
                <span>{commentCount}</span>
              </div>
              
              {discussionDepth > 0 && (
                <div className="flex items-center gap-1 text-purple-600">
                  <span>深度: {discussionDepth}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {isLocked ? (
                <div className="flex items-center gap-1 text-amber-600">
                  <Lock size={12} />
                  <span>已锁定</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600">
                  <Clock size={12} />
                  <span>进行中</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
