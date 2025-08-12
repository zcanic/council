'use client';

import { useState } from 'react';
import { api, CreateTopicInput } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus, X } from 'lucide-react';

interface CreateTopicButtonProps {
  onTopicCreated: () => void;
}

export default function CreateTopicButton({ onTopicCreated }: CreateTopicButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim().length < 5) {
      setError('议题标题至少需要5个字符');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.createTopic({ title: title.trim() });
      setTitle('');
      setIsOpen(false);
      onTopicCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setTitle('');
    setError('');
  };

  if (!isOpen) {
    return (
      <div className="flex items-center justify-center">
        <Button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2"
          size="lg"
        >
          <Plus size={16} />
          发起新议题
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 shadow-lg max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">发起新议题</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="p-1"
        >
          <X size={16} />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="议题标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入一个有意义的讨论话题..."
          error={error}
          maxLength={255}
          disabled={isLoading}
        />
        
        <div className="text-xs text-gray-500">
          好的议题会引发有价值的讨论，请认真思考后再发起。
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={isLoading || title.trim().length < 5}
            className="flex-1"
          >
            {isLoading ? '创建中...' : '创建议题'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
