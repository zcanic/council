'use client';

import { useState } from 'react';
import { TopicWithRelations, Summary, Comment } from '@/lib/api';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressRing from '@/components/ui/ProgressRing';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';
import { 
  Eye, 
  Trees, 
  MessageCircle, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';

interface ParliamentRoundCardProps {
  topic: TopicWithRelations;
  currentSummary?: Summary;
  comments: Comment[];
  parentId: string;
  parentType: 'topic' | 'summary';
  onCommentAdded: (newComment?: any, isLastComment?: boolean) => void;
  onToggleTreeView: () => void;
  isTreeView: boolean;
}

export default function ParliamentRoundCard({
  topic,
  currentSummary,
  comments,
  parentId,
  parentType,
  onCommentAdded,
  onToggleTreeView,
  isTreeView
}: ParliamentRoundCardProps) {
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  
  const progress = comments.length;
  const total = 10;
  const isLocked = progress >= total;
  const remainingSlots = total - progress;
  
  // 计算当前回合数
  const currentRound = currentSummary 
    ? topic.summaries.findIndex(s => s.id === currentSummary.id) + 2
    : 1;
    
  const totalRounds = topic.summaries.length + (isLocked ? 1 : 0);

  const handlePrevComment = () => {
    if (currentCommentIndex > 0) {
      setCurrentCommentIndex(currentCommentIndex - 1);
    }
  };

  const handleNextComment = () => {
    if (currentCommentIndex < comments.length - 1) {
      setCurrentCommentIndex(currentCommentIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Round Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ProgressRing 
                progress={progress} 
                total={total}
                size={60}
                strokeWidth={4}
              />
              <div>
                <CardTitle className="text-xl text-blue-900">
                  第 {currentRound} 回合
                  {currentSummary && (
                    <span className="text-sm font-normal text-purple-600 ml-2">
                      【AI总结讨论】
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {progress} 位参与者
                  </span>
                  {remainingSlots > 0 && (
                    <span className="text-amber-600 font-medium">
                      还需 {remainingSlots} 条评论触发AI
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <Sparkles size={14} />
                      AI正在提纯智慧...
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={isTreeView ? 'primary' : 'outline'}
                size="sm"
                onClick={onToggleTreeView}
                className="flex items-center gap-2"
              >
                <Trees size={16} />
                {isTreeView ? '树状视图' : '切换视图'}
              </Button>
              
              {comments.length > 0 && (
                <Button
                  variant={viewMode === 'detailed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
                  className="flex items-center gap-2"
                >
                  <Eye size={16} />
                  {viewMode === 'detailed' ? '详细模式' : '卡牌模式'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Discussion Content */}
      {comments.length === 0 ? (
        <Card className="text-center py-12 bg-gray-50">
          <CardContent>
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              第 {currentRound} 回合尚未开始
            </h3>
            <p className="text-gray-500">
              {currentSummary 
                ? '基于上轮AI总结，发起新一轮深度讨论' 
                : '成为第一个发表观点的人，引领讨论方向'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {viewMode === 'overview' ? (
            // Overview mode - show all comments
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  index={index}
                  total={comments.length}
                />
              ))}
            </div>
          ) : (
            // Detailed mode - card-based navigation
            <Card className="min-h-[300px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    正在阅读第 {currentCommentIndex + 1} 条，共 {comments.length} 条评论
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevComment}
                      disabled={currentCommentIndex === 0}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextComment}
                      disabled={currentCommentIndex === comments.length - 1}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CommentCard
                  comment={comments[currentCommentIndex]}
                  index={currentCommentIndex}
                  total={comments.length}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Participation Section */}
      {!isLocked && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              🎯 议会席位开放中
            </h3>
            <p className="text-green-700 text-sm">
              {remainingSlots === 1 
                ? '最后一个席位！您的发言将触发AI智慧提纯' 
                : `还有 ${remainingSlots} 个发言席位，每一个观点都珍贵`
              }
            </p>
          </div>
          
          <CommentForm
            parentId={parentId}
            parentType={parentType}
            onCommentAdded={onCommentAdded}
            currentCount={progress}
            maxComments={total}
          />
        </div>
      )}

      {/* Round Summary Info */}
      {totalRounds > 1 && (
        <div className="text-center text-sm text-gray-500 bg-purple-50 p-3 rounded border">
          💭 此议题已进行 {totalRounds} 轮讨论，智慧层层递进
        </div>
      )}
    </div>
  );
}
