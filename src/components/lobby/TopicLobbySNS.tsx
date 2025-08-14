'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Topic, api } from '@/lib/api';
import TopicNode from './TopicNode';
import CreateTopicButton from './CreateTopicButton';
import { useRealtimeTopics } from '@/hooks/useRealtimeData';
import { 
  SmartLoading, 
  RealtimeIndicator, 
  Skeleton, 
  ContentPlaceholder,
  ProgressiveContent
} from '@/components/ui/SNSMicroInteractions';
import { MessageSquare, Users, Sparkles } from 'lucide-react';

export default function TopicLobbySNS() {
  const router = useRouter();
  
  // 使用SNS级别的实时数据管理
  const { 
    data: topics, 
    loading, 
    error, 
    optimisticData, 
    isStale, 
    mutate, 
    refresh 
  } = useRealtimeTopics();

  const handleTopicClick = (topicId: string) => {
    // 预加载优化：立即跳转，同时预加载数据
    router.prefetch(`/topics/${topicId}`);
    router.push(`/topics/${topicId}`);
  };

  // SNS级别的乐观创建
  const handleTopicCreated = async (newTopicData: any) => {
    try {
      await mutate(
        () => api.createTopic(newTopicData),
        {
          ...newTopicData,
          id: `optimistic_${Date.now()}`,
          status: 'active',
          createdAt: new Date().toISOString(),
          _optimistic: true,
          _action: 'create',
          _resource: 'topic'
        }
      );
    } catch (error) {
      console.error('Failed to create topic:', error);
    }
  };

  // 加载状态
  if (loading && !topics) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 头部骨架 */}
        <div className="text-center py-8">
          <div className="w-64 h-8 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
          <div className="w-96 h-4 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
        
        {/* 创建按钮骨架 */}
        <div className="flex justify-center">
          <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        
        {/* 议题列表骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} lines={3} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && !topics) {
    return (
      <ContentPlaceholder
        icon={<MessageSquare size={48} />}
        title="加载议题失败"
        description={error}
        action={
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        }
      />
    );
  }

  const displayTopics = optimisticData || topics || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 头部带实时状态 */}
      <div className="text-center py-8 relative">
        <div className="absolute top-4 right-4">
          <RealtimeIndicator 
            isConnected={!error}
            lastUpdate={topics ? new Date() : undefined}
          />
        </div>
        
        <ProgressiveContent show={true} animation="fade">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">议会回环</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            在这里发现有价值的讨论议题。每个话题将经历10条评论的深度讨论，然后由AI提纯为智慧结晶。
          </p>
          
          {/* 实时统计 */}
          <div className="flex justify-center gap-8 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span>{displayTopics.length} 个议题</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>活跃讨论中</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>AI 智慧提纯</span>
            </div>
          </div>
        </ProgressiveContent>
      </div>

      {/* 创建按钮 */}
      <div className="flex justify-center">
        <SmartLoading isLoading={false} hasError={false} isOptimistic={false}>
          <CreateTopicButton onTopicCreated={handleTopicCreated} />
        </SmartLoading>
      </div>

      {/* 议题列表 */}
      <SmartLoading
        isLoading={loading}
        hasError={!!error}
        isOptimistic={false}
        className="transition-all duration-300"
      >
        {displayTopics.length === 0 ? (
          <ContentPlaceholder
            icon={<MessageSquare size={48} />}
            title="还没有议题"
            description="成为第一个创建议题的人，开启智慧讨论的旅程"
            action={<CreateTopicButton onTopicCreated={handleTopicCreated} />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTopics.map((topic, index) => (
              <ProgressiveContent
                key={topic.id}
                show={true}
                animation="scale"
                delay={index * 100}
              >
                <SmartLoading
                  isLoading={false}
                  hasError={false}
                  isOptimistic={topic._optimistic}
                >
                  <TopicNode
                    topic={topic}
                    onClick={() => handleTopicClick(topic.id)}
                  />
                </SmartLoading>
              </ProgressiveContent>
            ))}
          </div>
        )}
      </SmartLoading>

      {/* 数据过期提示 */}
      {isStale && (
        <ProgressiveContent show={true} animation="slide">
          <div className="fixed bottom-4 left-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              有新内容，
              <button 
                onClick={refresh}
                className="underline hover:no-underline"
              >
                点击刷新
              </button>
            </div>
          </div>
        </ProgressiveContent>
      )}
    </div>
  );
}
