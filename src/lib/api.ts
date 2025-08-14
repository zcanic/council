// API client for Parliament Loop

export interface Topic {
  id: string;
  title: string;
  status: 'active' | 'locked';
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author?: string;
  createdAt: string;
  topicId?: string;
  summaryId?: string;
}

export interface Summary {
  id: string;
  content: string;
  metadata: {
    consensus: string;
    disagreements: Array<{
      point: string;
      views: string[];
    }>;
    new_questions: string[];
  };
  createdAt: string;
  topicId: string;
  parentId?: string;
  children?: Summary[];
  comments?: Comment[];
}

export interface TopicWithRelations extends Topic {
  comments: Comment[];
  summaries: Summary[];
}

export interface CreateTopicInput {
  title: string;
}

export interface CreateCommentInput {
  content: string;
  author?: string;
  parentId: string;
  parentType: 'topic' | 'summary';
}

class ParliamentAPI {
  private baseURL: string;
  private timeout: number = 10000; // 10秒超时

  constructor() {
    // Fix: 在生产环境使用正确的服务器地址
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://council.zcanic.xyz'; // 明确指定生产服务器地址
  }

  // 通用的fetch包装，包含超时和错误处理
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接或稍后重试');
      }
      throw error;
    }
  }

  async getTopics(): Promise<Topic[]> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/api/topics`, {
      cache: 'no-cache',
    });
    if (!response.ok) {
      throw new Error('获取议题列表失败，请稍后重试');
    }
    return response.json();
  }

  async createTopic(input: CreateTopicInput): Promise<Topic> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/api/topics`, {
      method: 'POST',
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建议题失败，请重试');
    }

    return response.json();
  }

  async getTopicTree(id: string): Promise<TopicWithRelations> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/api/topics/${id}`, {
      cache: 'no-cache',
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('议题不存在');
      }
      throw new Error('获取议题详情失败，请刷新重试');
    }
    return response.json();
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/api/comments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 403) {
        throw new Error('此讨论回环已锁定，AI正在生成摘要');
      }
      if (response.status === 503) {
        throw new Error('AI服务暂时不可用，请稍后再试');
      }
      throw new Error(error.message || '发布评论失败，请重试');
    }

    return response.json();
  }

  async checkHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseURL}/api/health`);
      return response.json();
    } catch (error) {
      return { status: 'error', message: '服务器连接失败' };
    }
  }
}

export const api = new ParliamentAPI();
