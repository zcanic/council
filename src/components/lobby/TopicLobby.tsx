/**
 * 🏛️ Parliament Loop - 完美话题大厅
 * 
 * 基于重构架构的话题大厅组件
 * Jobs式的完美主义体现：每一个像素都经过精心设计
 */

'use client';

import { Search, Plus, Filter, Grid, List, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';

import { useRealtimeData } from '@/hooks/useRealtimeData';
import { cn } from '@/lib/utils';

// 类型定义
interface Topic {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'locked' | 'completed';
  commentCount: number;
  summaryCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TopicLobbyProps {
  className?: string;
}

// 视图模式枚举
type ViewMode = 'grid' | 'list';
type SortMode = 'latest' | 'trending' | 'popular';

/**
 * 🎨 完美的话题卡片组件
 */
function TopicCard({ topic, onClick, className }: {
  topic: Topic;
  onClick: (topicId: string) => void;
  className?: string;
}) {
  const statusConfig = {
    active: {
      label: '讨论中',
      color: 'bg-green-100 text-green-800',
      icon: '💬'
    },
    locked: {
      label: 'AI处理中',
      color: 'bg-blue-100 text-blue-800',
      icon: '🤖'
    },
    completed: {
      label: '已完成',
      color: 'bg-purple-100 text-purple-800',
      icon: '✨'
    }
  };

  const status = statusConfig[topic.status];
  const progress = Math.min((topic.commentCount / 10) * 100, 100);

  return (
    <div
      className={cn(
        'group relative p-6 bg-white rounded-xl border border-gray-200',
        'hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer',
        'transform hover:-translate-y-1',
        className
      )}
      onClick={() => onClick(topic.id)}
    >
      {/* 状态标签 */}
      <div className="flex items-center justify-between mb-3">
        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', status.color)}>
          <span className="mr-1">{status.icon}</span>
          {status.label}
        </span>
        <div className="text-xs text-gray-500">
          {new Date(topic.createdAt).toLocaleDateString('zh-CN')}
        </div>
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {topic.title}
      </h3>

      {/* 描述 */}
      {topic.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {topic.description}
        </p>
      )}

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>讨论进度</span>
          <span>{topic.commentCount}/10 条评论</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="mr-1">💬</span>
            {topic.commentCount}
          </span>
          {topic.summaryCount > 0 && (
            <span className="flex items-center">
              <span className="mr-1">📊</span>
              {topic.summaryCount}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <span className="mr-1">👁</span>
          {topic.viewCount}
        </div>
      </div>

      {/* 悬停效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/50 rounded-xl transition-all duration-300 pointer-events-none" />
    </div>
  );
}

/**
 * 🎨 创建话题按钮
 */
function CreateTopicButton({ onTopicCreated }: { onTopicCreated: () => void }) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTopic = async () => {
    setIsCreating(true);
    try {
      // TODO: 实现创建话题逻辑
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      onTopicCreated();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreateTopic}
      disabled={isCreating}
      className={cn(
        'inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600',
        'text-white rounded-xl font-semibold shadow-lg hover:shadow-xl',
        'transform hover:scale-105 transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
      )}
    >
      {isCreating ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          创建中...
        </>
      ) : (
        <>
          <Plus className="w-5 h-5 mr-2" />
          发起新议题
        </>
      )}
    </button>
  );
}

/**
 * 🎨 搜索和过滤栏
 */
function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  sortMode,
  setSortMode
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-white rounded-xl shadow-sm border">
      {/* 搜索框 */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="搜索议题..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 控制按钮组 */}
      <div className="flex items-center space-x-3">
        {/* 排序模式 */}
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="latest">🕒 最新</option>
          <option value="trending">🔥 热门</option>
          <option value="popular">👥 人气</option>
        </select>

        {/* 视图切换 */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'px-3 py-2 transition-colors',
              viewMode === 'grid' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-2 transition-colors',
              viewMode === 'list' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 🏛️ 完美话题大厅主组件
 */
export default function TopicLobby({ className }: TopicLobbyProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('latest');

  // 使用完美的实时数据Hook
  const { data: topics, loading, error, refresh } = useRealtimeData<Topic[]>({
    fetchFn: async () => {
      // TODO: 替换为实际的API调用
      return [
        {
          id: '1',
          title: '人工智能是否会取代程序员？',
          description: '随着AI技术的快速发展，很多人担心程序员这个职业会被AI取代。让我们讨论一下这个话题...',
          status: 'active' as const,
          commentCount: 7,
          summaryCount: 0,
          viewCount: 142,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2', 
          title: '远程工作的利与弊',
          description: '疫情改变了我们的工作方式，远程工作成为新常态。你觉得远程工作好还是坏？',
          status: 'locked' as const,
          commentCount: 10,
          summaryCount: 0,
          viewCount: 89,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ] as Topic[];
    },
    refreshInterval: 30000, // 30秒自动刷新
    dependencies: [],
    retryOnError: true
  });

  // 过滤和排序逻辑
  const filteredAndSortedTopics = useMemo(() => {
    if (!topics) return [];

    let filtered = topics;

    // 搜索过滤
    if (searchQuery.trim()) {
      filtered = filtered.filter((topic: Topic) =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 排序
    filtered.sort((a: Topic, b: Topic) => {
      switch (sortMode) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'trending':
          return (b.commentCount + b.viewCount) - (a.commentCount + a.viewCount);
        case 'popular':
          return b.viewCount - a.viewCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [topics, searchQuery, sortMode]);

  const handleTopicClick = useCallback((topicId: string) => {
    router.push(`/topics/${topicId}`);
  }, [router]);

  const handleTopicCreated = useCallback(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 搜索栏骨架 */}
        <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        
        {/* 卡片网格骨架 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-6xl mb-4">😵</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={refresh}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className={cn('max-w-7xl mx-auto space-y-8', className)}>
      {/* 搜索和过滤 */}
      <SearchAndFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortMode={sortMode}
        setSortMode={setSortMode}
      />

      {/* 创建话题按钮 */}
      <div className="flex justify-center">
        <CreateTopicButton onTopicCreated={handleTopicCreated} />
      </div>

      {/* 话题列表 */}
      {filteredAndSortedTopics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">
              {searchQuery ? '🔍' : '💭'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? '未找到相关议题' : '还没有任何议题'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? '尝试调整搜索关键词或创建一个新议题' 
                : '成为第一个发起讨论的人，创建一个有价值的议题吧！'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        )}>
          {filteredAndSortedTopics.map((topic: Topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={handleTopicClick}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}

      {/* 统计信息 */}
      <div className="text-center text-sm text-gray-500 py-4">
        显示 {filteredAndSortedTopics.length} 个议题
        {searchQuery && ` (搜索: "${searchQuery}")`}
      </div>
    </div>
  );
}
