'use client';

import { Comment } from '@/lib/api';
import Card, { CardContent } from '@/components/ui/Card';
import { User, Clock } from 'lucide-react';

interface CommentCardProps {
  comment: Comment;
  index: number;
  total: number;
}

export default function CommentCard({ comment, index, total }: CommentCardProps) {
  return (
    <Card className="mb-4">
      <CardContent className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <User size={14} />
            <span>{comment.author || '匿名用户'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span className="text-xs">
                {new Date(comment.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              #{index + 1}/{total}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="text-gray-900 leading-relaxed">
          {comment.content}
        </div>
      </CardContent>
    </Card>
  );
}
