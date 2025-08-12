'use client';

import { TopicWithRelations, Summary } from '@/lib/api';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  ArrowRight, 
  MessageCircle, 
  Sparkles, 
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

interface WisdomTreeViewProps {
  topic: TopicWithRelations;
  currentSummaryId?: string;
  onNodeClick: (nodeId: string, nodeType: 'topic' | 'summary') => void;
  onBackToParliament: () => void;
}

interface TreeNodeProps {
  id: string;
  title: string;
  type: 'topic' | 'summary';
  commentCount: number;
  isActive: boolean;
  isLocked?: boolean;
  level: number;
  onClick: () => void;
  children?: React.ReactNode;
}

function TreeNode({ 
  title, 
  type, 
  commentCount, 
  isActive, 
  isLocked = false, 
  level, 
  onClick, 
  children 
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const getNodeColor = () => {
    if (isActive) return 'bg-blue-100 border-blue-300 text-blue-900';
    if (type === 'summary') return 'bg-purple-50 border-purple-200 text-purple-800';
    if (isLocked) return 'bg-amber-50 border-amber-200 text-amber-800';
    return 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100';
  };
  
  const getIcon = () => {
    if (type === 'summary') return <Sparkles size={16} />;
    if (isLocked) return <MessageCircle size={16} className="text-amber-600" />;
    return <MessageCircle size={16} />;
  };
  
  return (
    <div className="relative">
      {/* Connection line for child nodes */}
      {level > 0 && (
        <div className="absolute left-0 top-0 w-6 h-6 border-l-2 border-b-2 border-gray-300 rounded-bl-lg"></div>
      )}
      
      <div 
        className={`
          relative ml-${level * 6} mb-3 p-3 rounded-lg border cursor-pointer transition-all
          ${getNodeColor()}
        `}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {getIcon()}
            <span className="font-medium text-sm line-clamp-2">{title}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-white bg-opacity-50 px-2 py-1 rounded">
              {commentCount}/10
            </span>
            
            {children && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </Button>
            )}
          </div>
        </div>
        
        {isActive && (
          <div className="mt-2 text-xs text-blue-700 font-medium">
            正在查看此节点
          </div>
        )}
      </div>
      
      {/* Child nodes */}
      {children && isExpanded && (
        <div className="ml-6 border-l-2 border-gray-200 pl-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function WisdomTreeView({ 
  topic, 
  currentSummaryId, 
  onNodeClick, 
  onBackToParliament 
}: WisdomTreeViewProps) {
  // 递归渲染Summary节点
  const renderSummaryNodes = (summaries: Summary[], level: number) => {
    return summaries.map((summary) => (
      <TreeNode
        key={summary.id}
        id={summary.id}
        title={summary.content.substring(0, 100) + (summary.content.length > 100 ? '...' : '')}
        type="summary"
        commentCount={summary.comments?.length || 0}
        isActive={summary.id === currentSummaryId}
        level={level}
        onClick={() => onNodeClick(summary.id, 'summary')}
      >
        {summary.children && summary.children.length > 0 && 
          renderSummaryNodes(summary.children, level + 1)
        }
      </TreeNode>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-purple-600" size={20} />
              智慧之树
            </CardTitle>
            <Button
              variant="outline"
              onClick={onBackToParliament}
              className="flex items-center gap-2"
            >
              <RotateCcw size={16} />
              返回议会模式
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            追溯讨论的完整演化路径，每个节点代表一轮10条评论的智慧结晶
          </p>
        </CardContent>
      </Card>

      {/* Tree Structure */}
      <Card>
        <CardContent className="p-6">
          {/* Root Topic Node */}
          <TreeNode
            id={topic.id}
            title={topic.title}
            type="topic"
            commentCount={topic.comments.length}
            isActive={!currentSummaryId}
            isLocked={topic.status === 'locked'}
            level={0}
            onClick={() => onNodeClick(topic.id, 'topic')}
          >
            {topic.summaries && topic.summaries.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 mt-2">
                  <ArrowRight size={14} />
                  <span>AI智慧提纯后的演化分支</span>
                </div>
                {renderSummaryNodes(topic.summaries, 1)}
              </>
            )}
          </TreeNode>
          
          {/* Tree Statistics */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-semibold text-blue-900">
                  {topic.summaries.length + 1}
                </div>
                <div className="text-blue-600">讨论节点</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="font-semibold text-green-900">
                  {topic.comments.length + (topic.summaries.reduce((sum, s) => sum + (s.comments?.length || 0), 0))}
                </div>
                <div className="text-green-600">总评论数</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="font-semibold text-purple-900">
                  {Math.floor((topic.comments.length + (topic.summaries.reduce((sum, s) => sum + (s.comments?.length || 0), 0))) / 10)}
                </div>
                <div className="text-purple-600">AI提纯次数</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>蓝色节点：当前查看的讨论</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
              <span>紫色节点：AI智慧总结</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded"></div>
              <span>橙色节点：已锁定（等待AI处理）</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 修复useState导入
import { useState } from 'react';
