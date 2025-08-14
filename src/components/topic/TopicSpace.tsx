'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { TopicWithRelations, Summary, api } from '@/lib/api';

import ParliamentRoundCard from './ParliamentRoundCard';
import SummaryCard from './SummaryCard';
import TopicHeader from './TopicHeader';
import WisdomTreeView from './WisdomTreeView';


type ViewMode = 'parliament' | 'tree';

interface TopicSpaceProps {
  topicId: string;
  summaryId?: string;
}

const findSummaryById = (summaries: Summary[], id: string): Summary | null => {
  for (const summary of summaries) {
    if (summary.id === id) {
      return summary;
    }
    if (summary.children) {
      const found = findSummaryById(summary.children, id);

      if (found) return found;
    }
  }

  return null;
};

export default function TopicSpace({ topicId, summaryId }: TopicSpaceProps) {
  const router = useRouter();
  const [topicData, setTopicData] = useState<TopicWithRelations | null>(null);
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('parliament');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopicData = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await api.getTopicTree(topicId);

      setTopicData(data);
      
      if (summaryId && data.summaries) {
        const summary = findSummaryById(data.summaries, summaryId);

        setCurrentSummary(summary);
      } else {
        setCurrentSummary(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch topic:', err);
      setError(err instanceof Error ? err.message : '获取议题失败');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [topicId, summaryId]);

  useEffect(() => {
    fetchTopicData();
  }, [topicId, summaryId, fetchTopicData]);

  const handleBack = () => {
    router.push('/');
  };

  const handleTopicClick = () => {
    router.push(`/topics/${topicId}`);
  };

  const handleToggleTreeView = () => {
    setViewMode(viewMode === 'parliament' ? 'tree' : 'parliament');
  };

  const handleTreeNodeClick = (nodeId: string, nodeType: 'topic' | 'summary') => {
    if (nodeType === 'topic') {
      router.push(`/topics/${topicId}`);
    } else {
      router.push(`/topics/${topicId}/summaries/${nodeId}`);
    }
  };

  const handleCommentAdded = (newComment?: any, isLastComment?: boolean) => {
    if (!topicData) return;
    
    const currentParentType = currentSummary ? 'summary' as const : 'topic' as const;
    
    // 简化的乐观更新：只添加评论，不处理复杂的状态同步
    if (newComment) {
      if (currentParentType === 'topic') {
        setTopicData(prev => {
          if (!prev) return null;

          return {
            ...prev,
            status: isLastComment ? 'locked' as const : prev.status,
            comments: [...prev.comments, newComment]
          };
        });
      } else if (currentParentType === 'summary' && currentSummary) {
        setCurrentSummary(prev => prev ? {
          ...prev,
          comments: [...(prev.comments || []), newComment]
        } : null);
      }
    }
    
    // 延迟刷新以确保后端数据同步，减少延迟时间
    setTimeout(() => fetchTopicData(false), 300);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !topicData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || '议题不存在'}</p>
        <button 
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          返回大厅
        </button>
      </div>
    );
  }

  const displayComments = currentSummary ? (currentSummary.comments || []) : topicData.comments;
  const parentId = currentSummary ? currentSummary.id : topicData.id;
  const parentType = currentSummary ? 'summary' as const : 'topic' as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <TopicHeader 
        topic={topicData}
        currentSummary={currentSummary || undefined}
        onBack={handleBack}
        onTopicClick={handleTopicClick}
      />

      {/* Main Content Area */}
      {viewMode === 'parliament' ? (
        <div className="space-y-6">
          {/* Current Summary Display (if viewing summary discussion) */}
          {currentSummary && (
            <SummaryCard summary={currentSummary} />
          )}

          {/* Parliament Round Card - Core Component */}
          <ParliamentRoundCard
            topic={topicData}
            currentSummary={currentSummary || undefined}
            comments={displayComments}
            parentId={parentId}
            parentType={parentType}
            onCommentAdded={handleCommentAdded}
            onToggleTreeView={handleToggleTreeView}
            isTreeView={false}
          />

          {/* Historical Summaries (only on main topic, not summary discussions) */}
          {!currentSummary && topicData.summaries && topicData.summaries.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  历史智慧总结 ({topicData.summaries.length})
                </h2>
                <button
                  onClick={handleToggleTreeView}
                  className="text-sm text-purple-600 hover:text-purple-700 underline"
                >
                  查看完整智慧树 →
                </button>
              </div>
              
              <div className="grid gap-4">
                {topicData.summaries.slice(0, 2).map((summary, index) => (
                  <div key={summary.id} className="relative">
                    <div className="text-xs text-gray-500 mb-2">
                      第 {index + 1} 轮总结
                    </div>
                    <SummaryCard 
                      summary={summary}
                      onClick={() => router.push(`/topics/${topicId}/summaries/${summary.id}`)}
                    />
                  </div>
                ))}
                
                {topicData.summaries.length > 2 && (
                  <button
                    onClick={handleToggleTreeView}
                    className="text-center py-4 text-purple-600 hover:text-purple-700 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    查看全部 {topicData.summaries.length} 轮智慧总结 →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tree View Mode */
        <WisdomTreeView
          topic={topicData}
          currentSummaryId={currentSummary?.id}
          onNodeClick={handleTreeNodeClick}
          onBackToParliament={handleToggleTreeView}
        />
      )}
    </div>
  );
}
