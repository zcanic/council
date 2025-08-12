'use client';

import { Summary } from '@/lib/api';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Sparkles, MessageSquare, HelpCircle } from 'lucide-react';

interface SummaryCardProps {
  summary: Summary;
  onClick?: () => void;
}

export default function SummaryCard({ summary, onClick }: SummaryCardProps) {
  const { metadata } = summary;
  const hasNewComments = (summary.comments?.length || 0) > 0;
  
  return (
    <Card 
      onClick={onClick}
      className={`
        border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all' : ''}
      `}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Sparkles size={18} />
          AI智慧总结
          {hasNewComments && (
            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {summary.comments?.length} 新讨论
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 核心共识 */}
        <div>
          <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
            <MessageSquare size={14} />
            核心共识
          </h4>
          <p className="text-sm text-gray-700 bg-white p-3 rounded border-l-4 border-blue-400">
            {metadata.consensus}
          </p>
        </div>
        
        {/* 主要分歧 */}
        {metadata.disagreements && metadata.disagreements.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">主要分歧</h4>
            <div className="space-y-2">
              {metadata.disagreements.map((disagreement, idx) => (
                <div key={idx} className="text-sm bg-white p-3 rounded border-l-4 border-orange-400">
                  <div className="font-medium text-orange-800 mb-1">{disagreement.point}</div>
                  <ul className="text-gray-600 text-xs space-y-1">
                    {disagreement.views.map((view, viewIdx) => (
                      <li key={viewIdx} className="ml-2">• {view}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 新问题 */}
        {metadata.new_questions && metadata.new_questions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
              <HelpCircle size={14} />
              引发的新问题
            </h4>
            <ul className="space-y-1">
              {metadata.new_questions.map((question, idx) => (
                <li key={idx} className="text-sm text-gray-700 bg-white p-2 rounded border-l-4 border-green-400">
                  {question}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 底部信息 */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          总结于 {new Date(summary.createdAt).toLocaleString('zh-CN')}
          {onClick && hasNewComments && (
            <span className="ml-2 text-green-600">点击查看新讨论</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
