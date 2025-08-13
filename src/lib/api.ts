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

  constructor() {
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' 
      : '';
  }

  async getTopics(): Promise<Topic[]> {
    const response = await fetch(`${this.baseURL}/api/topics`);
    if (!response.ok) {
      throw new Error('Failed to fetch topics');
    }
    return response.json();
  }

  async createTopic(input: CreateTopicInput): Promise<Topic> {
    const response = await fetch(`${this.baseURL}/api/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create topic');
    }

    return response.json();
  }

  async getTopicTree(id: string): Promise<TopicWithRelations> {
    const response = await fetch(`${this.baseURL}/api/topics/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Topic not found');
      }
      throw new Error('Failed to fetch topic');
    }
    return response.json();
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const response = await fetch(`${this.baseURL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 403) {
        throw new Error('This discussion loop is locked.');
      }
      if (response.status === 503) {
        throw new Error('AI service is currently unavailable.');
      }
      throw new Error(error.message || 'Failed to create comment');
    }

    return response.json();
  }

  async checkHealth(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseURL}/api/health`);
    return response.json();
  }
}

export const api = new ParliamentAPI();
