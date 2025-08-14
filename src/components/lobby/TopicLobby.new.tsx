/**
 * TopicLobby - 重构版本
 * 
 * 设计理念：议会大厅的庄重感 + 现代数字体验的流畅感
 * 
 * UX原则：
 * 1. 一眼就能理解系统的价值和使用方法
 * 2. 让每个议题都能展现其独特性和重要性
 * 3. 创造"发现"的愉悦感，而不是"浏览"的疲劳感
 * 4. 操作反馈要即时、明确、有仪式感
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Topic, api } from '@/lib/api';
import Card from '@/components/ui/Card.new';
import Button, { FloatingActionButton } from '@/components/ui/Button.new';
import { cn, formatDate } from '@/lib/utils';
import { 
  Plus, 
  MessageSquare, 
  TreePine, 
  Clock, 
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';

// 议题状态映射
const topicStatusConfig = {
  active: {
    label: '讨论中',
    color: 'text-success-700 bg-success-100 border-success-200',
    icon: MessageSquare,
    description: '正在收集智慧'
  },
  locked: {
    label: '已锁定',
    color: 'text-warning-700 bg-warning-100 border-warning-200', 
    icon: TreePine,
    description: '即将生成总结'
  },
  completed: {
    label: '已完成',
    color: 'text-primary-700 bg-primary-100 border-primary-200',
    icon: Sparkles,
    description: '智慧结晶诞生'
  }
} as const;

interface TopicNodeProps {
  topic: Topic;
  onClick: () => void;
}

// 重构的议题卡片 - 更具表现力的设计
function TopicNode({ topic, onClick }: TopicNodeProps) {
  const status = topic.status || 'active';
  const config = topicStatusConfig[status as keyof typeof topicStatusConfig];
  const StatusIcon = config.icon;
  
  // 暂时使用模拟数据，实际应该从API获取
  const commentCount = 0; // TODO: 从API获取真实数据
  const summaryCount = 0; // TODO: 从API获取真实数据
  const progress = Math.min((commentCount / 10) * 100, 100);
  
  return (
    <Card
      onClick={onClick}
      className={cn(
        'group cursor-pointer transition-all duration-300',
        'hover:scale-[1.02] hover:-translate-y-2',
        'hover:shadow-xl hover:shadow-primary-500/20',
        'border-l-4 border-l-primary-400',
        'min-h-[180px] flex flex-col'
      )}
      variant="interactive"
    >
      {/* 头部状态区 */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
          config.color
        )}>
          <StatusIcon size={12} />
          {config.label}
        </div>
        
        {summaryCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
            <Sparkles size={12} />
            {summaryCount}层深度
          </div>
        )}
      </div>

      {/* 议题标题 */}
      <h3 className={cn(
        'text-lg font-semibold text-neutral-900 leading-tight mb-3',
        'line-clamp-2 flex-1',
        'group-hover:text-primary-700 transition-colors'
      )}>
        {topic.title}
      </h3>

      {/* 进度指示器 */}
      {status === 'active' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
            <span>讨论进度</span>
            <span className="font-medium">{commentCount}/10</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div 
              className={cn(
                'h-full bg-gradient-to-r transition-all duration-500',
                progress < 50 ? 'from-primary-400 to-primary-500' :
                progress < 80 ? 'from-warning-400 to-warning-500' :
                'from-success-400 to-success-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 底部信息区 */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MessageSquare size={12} />
            <span>{commentCount}</span>
          </div>
          
          {summaryCount > 0 && (
            <div className="flex items-center gap-1">
              <TreePine size={12} />
              <span>{summaryCount}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatDate(topic.createdAt)}</span>
        </div>
      </div>

      {/* 悬停时的操作提示 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
      </div>
    </Card>
  );
}

// 创建议题按钮组件
interface CreateTopicButtonProps {
  onTopicCreated: (newTopic?: any) => void;
}

function CreateTopicButton({ onTopicCreated }: CreateTopicButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    try {
      setLoading(true);
      const newTopic = await api.createTopic({ title: title.trim() });
      setTitle('');
      setIsOpen(false);
      onTopicCreated(newTopic);
    } catch (error) {
      console.error('Failed to create topic:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isOpen) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-2 border-primary-200 bg-primary-50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              发起新的议题讨论
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入您想讨论的议题..."
              className={cn(
                'w-full px-4 py-3 border border-neutral-300 rounded-lg',
                'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                'placeholder:text-neutral-400 text-neutral-900',
                'transition-all duration-200'
              )}
              autoFocus
              maxLength={200}
            />
            <p className="text-xs text-neutral-600 mt-1">
              {title.length}/200 字符
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              type="submit" 
              disabled={!title.trim()} 
              loading={loading}
              leftIcon={<Sparkles size={16} />}
            >
              发起讨论
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
            >
              取消
            </Button>
          </div>
          
          <div className="bg-white border border-primary-200 rounded-lg p-3">
            <p className="text-xs text-neutral-600 leading-relaxed">
              💡 您的议题将会吸引其他用户参与讨论。当收集到10条有价值的评论后，AI将自动生成智慧总结，开启新一轮的深度思考。
            </p>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Button
      onClick={() => setIsOpen(true)}
      size="lg"
      leftIcon={<Plus size={20} />}
      className="shadow-lg hover:shadow-xl"
    >
      发起新议题
    </Button>
  );
}

// 主组件
export default function TopicLobby() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'locked' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'progress'>('newest');

  // 获取议题数据
  const fetchTopics = async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await api.getTopics();
      setTopics(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch topics:', err);
      setError('获取议题列表失败，请稍后重试');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // 过滤和排序逻辑
  const filteredAndSortedTopics = useMemo(() => {
    let filtered = topics;
    
    // 状态过滤
    if (filter !== 'all') {
      filtered = topics.filter(topic => topic.status === filter);
    }
    
    // 排序
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          // TODO: 从API获取真实评论数据
          return 0; // 暂时返回0，保持原顺序
        case 'progress':
          // TODO: 从API获取真实进度数据
          return 0; // 暂时返回0，保持原顺序
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return sorted;
  }, [topics, filter, sortBy]);

  // 事件处理
  const handleTopicClick = (topicId: string) => {
    router.push(`/topics/${topicId}`);
  };

  const handleTopicCreated = (newTopic?: any) => {
    if (newTopic) {
      setTopics(prev => [newTopic, ...prev]);
      setTimeout(() => fetchTopics(false), 500);
    } else {
      fetchTopics();
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-lg font-medium text-neutral-700">正在加载议会大厅...</p>
          <p className="text-sm text-neutral-500">准备发现有价值的讨论</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">连接失败</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          <Button onClick={() => fetchTopics()}>重新尝试</Button>
        </Card>
      </div>
    );
  }

  const stats = {
    total: topics.length,
    active: topics.filter(t => t.status === 'active').length,
    locked: topics.filter(t => t.status === 'locked').length,
    completed: 0 // TODO: 当API支持completed状态时更新
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="content-container py-8 space-y-8">
        
        {/* 页面头部 */}
        <section className="text-center py-12 space-y-6">
          <div className="space-y-4">
            <h1 className="heading-primary">
              议会回环
            </h1>
            <p className="text-body-large max-w-3xl mx-auto leading-relaxed text-neutral-600">
              在这里发现和参与有深度的讨论。每个议题都会经历10条评论的充分讨论，
              然后由AI提炼成<span className="text-primary-600 font-semibold">智慧结晶</span>，
              开启更深层次的思考旅程。
            </p>
          </div>
          
          {/* 统计数据 */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">{stats.active}</div>
              <div className="text-neutral-600">讨论中</div>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600">{stats.locked}</div>
              <div className="text-neutral-600">即将总结</div>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.completed}</div>
              <div className="text-neutral-600">智慧结晶</div>
            </div>
          </div>
        </section>

        {/* 操作区域 */}
        <section className="flex flex-col lg:flex-row items-center gap-6 bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex-1">
            <CreateTopicButton onTopicCreated={handleTopicCreated} />
          </div>
          
          {/* 过滤器 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-neutral-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">全部状态</option>
                <option value="active">讨论中</option>
                <option value="locked">已锁定</option>
                <option value="completed">已完成</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-neutral-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="newest">最新发布</option>
                <option value="popular">最多讨论</option>
                <option value="progress">讨论进度</option>
              </select>
            </div>
          </div>
        </section>

        {/* 议题网格 */}
        <section>
          {filteredAndSortedTopics.length === 0 ? (
            <Card className="text-center py-16 bg-gradient-to-br from-neutral-50 to-primary-50 border-2 border-dashed border-primary-200">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-10 h-10 text-primary-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-neutral-900">
                    {filter === 'all' ? '还没有任何议题' : '暂无符合条件的议题'}
                  </h3>
                  <p className="text-neutral-600">
                    {filter === 'all' 
                      ? '成为第一个发起深度讨论的人！' 
                      : '尝试调整筛选条件或发起新的讨论'}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="parliament-grid">
              {filteredAndSortedTopics.map((topic) => (
                <TopicNode
                  key={topic.id}
                  topic={topic}
                  onClick={() => handleTopicClick(topic.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 页面底部信息 */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-8 text-white text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h3 className="text-xl font-semibold">智慧回环的工作原理</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-medium">深度讨论</h4>
                <p className="opacity-90">每个议题收集10条高质量评论</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-medium">AI总结</h4>
                <p className="opacity-90">自动提炼讨论精华，生成智慧结晶</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <TreePine className="w-6 h-6" />
                </div>
                <h4 className="font-medium">智慧演进</h4>
                <p className="opacity-90">总结成为新起点，思考不断深化</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* 悬浮操作按钮 */}
      <FloatingActionButton
        icon={<Plus size={24} />}
        onClick={() => {
          const createButton = document.querySelector('[data-create-topic]');
          createButton?.scrollIntoView({ behavior: 'smooth' });
        }}
        aria-label="快速发起新议题"
      />
    </div>
  );
}
