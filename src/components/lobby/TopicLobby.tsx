'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Topic, api } from '@/lib/api';
import TopicNode from './TopicNode';
import CreateTopicButton from './CreateTopicButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TopicLobby() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await api.getTopics();
      setTopics(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch topics:', err);
      setError('获取议题列表失败');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleTopicClick = (topicId: string) => {
    // 使用 router.push 进行客户端路由，比页面刷新快
    router.push(`/topics/${topicId}`);
  };

  const handleTopicCreated = (newTopic?: any) => {
    if (newTopic) {
      // 乐观更新：立即添加新话题到列表顶部
      setTopics(prev => [newTopic, ...prev]);
      // 延迟静默刷新确保数据一致性
      setTimeout(() => fetchTopics(false), 500);
    } else {
      // 备用方案：重新获取数据
      fetchTopics();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">加载议题中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => fetchTopics()}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">议会回环</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          在这里发现有价值的讨论议题。每个话题将经历10条评论的深度讨论，然后由AI提纯为智慧结晶。
        </p>
      </div>

      {/* Create Topic Button */}
      <div className="flex justify-center">
        <CreateTopicButton onTopicCreated={handleTopicCreated} />
      </div>

      {/* Topics Grid */}
      {topics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-xl text-gray-500 mb-2">还没有任何议题</p>
            <p className="text-gray-400">成为第一个发起讨论的人吧！</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topics.map((topic) => (
            <TopicNode
              key={topic.id}
              topic={topic}
              onClick={() => handleTopicClick(topic.id)}
            />
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <span className="text-xl">💡</span>
            每个议题收集10条评论后，AI将自动生成智慧总结
          </p>
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <span className="text-xl">🌳</span>
            总结会成为新的讨论起点，形成不断进化的智慧之树
          </p>
        </div>
      </div>
    </div>
  );
}
