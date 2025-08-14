/**
 * 🎯 Parliament Loop 基础设施层 - AI服务实现
 * 实现AI相关的领域服务接口
 */

import OpenAI from 'openai';

import type { 
  Comment, 
  AISummaryMetadata,
  NodeType,
  EntityId,
  WisdomLoop,
  Summary
} from '../domain/entities';
import type { 
  IAIService,
  IDiscussionLockService,
  INotificationService,
  ICacheService
} from '../domain/services';

/**
 * 🤖 Moonshot AI 服务实现
 */
export class MoonshotAIService implements IAIService {
  private client: OpenAI;
  private config: {
    modelName: string;
    maxTokens: number;
    temperature: number;
    baseURL: string;
    apiKey: string;
  };

  constructor(config: {
    modelName?: string;
    maxTokens?: number;
    temperature?: number;
    baseURL?: string;
    apiKey: string;
  }) {
    this.config = {
      modelName: config.modelName || 'moonshot-v1-8k',
      maxTokens: config.maxTokens || 2000,
      temperature: config.temperature || 0.5,
      baseURL: config.baseURL || 'https://api.moonshot.cn/v1',
      apiKey: config.apiKey
    };

    this.client = new OpenAI({
      baseURL: this.config.baseURL,
      apiKey: this.config.apiKey
    });
  }

  async summarizeComments(comments: Comment[]): Promise<AISummaryMetadata> {
    if (comments.length === 0) {
      throw new Error('Cannot summarize empty comment list');
    }

    const prompt = this.buildSummarizationPrompt(comments);

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages: [
          {
            role: 'system',
            content: '你是一个绝对中立、逻辑严谨、精通信息提纯的"书记官"。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('AI service returned no content');
      }

      const parsedJson = JSON.parse(content);

      return this.validateResponse(parsedJson);

    } catch (error: unknown) {
      console.error('AI service error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      throw new Error(`AI summarization failed: ${errorMessage}`);
    }
  }

  async checkHealth(): Promise<{ isHealthy: boolean; latency?: number; error?: string }> {
    try {
      const startTime = Date.now();
      
      const response = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages: [
          { role: 'user', content: '健康检查：请回复"OK"' }
        ],
        max_tokens: 10,
        temperature: 0
      });

      const latency = Date.now() - startTime;
      
      if (response.choices[0]?.message?.content) {
        return { isHealthy: true, latency };
      } else {
        return { isHealthy: false, error: 'No response content' };
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      return { 
        isHealthy: false, 
        error: errorMessage 
      };
    }
  }

  async getConfiguration(): Promise<{
    modelName: string;
    maxTokens: number;
    temperature: number;
    responseFormat: string;
  }> {
    return {
      modelName: this.config.modelName,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      responseFormat: 'json_object'
    };
  }

  async validateResponse(response: any): Promise<AISummaryMetadata> {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid AI response format');
    }

    const requiredFields = ['consensus', 'disagreements', 'new_questions'];

    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // 验证 disagreements 结构
    if (!Array.isArray(response.disagreements)) {
      throw new Error('Disagreements must be an array');
    }

    for (const disagreement of response.disagreements) {
      if (!disagreement.point || !Array.isArray(disagreement.views)) {
        throw new Error('Invalid disagreement structure');
      }
    }

    // 验证 new_questions 结构
    if (!Array.isArray(response.new_questions)) {
      throw new Error('New questions must be an array');
    }

    return {
      consensus: response.consensus,
      disagreements: response.disagreements,
      new_questions: response.new_questions,
      model: this.config.modelName,
      timestamp: new Date().toISOString(),
      confidence_score: response.confidence_score || 0.8
    };
  }

  private buildSummarizationPrompt(comments: Comment[]): string {
    const commentTexts = comments
      .map((comment, index) => `${index + 1}. ${comment.content}`)
      .join('\n');

    return `
你的输出必须严格遵守以下JSON结构：
{
  "consensus": "核心共识描述",
  "disagreements": [
    {
      "point": "分歧点描述",
      "views": ["观点A", "观点B"]
    }
  ],
  "new_questions": [
    "有价值的新问题1",
    "有价值的新问题2"
  ],
  "confidence_score": 0.85
}

以下是${comments.length}条评论内容，请进行智慧提纯：

${commentTexts}

请分析这些评论，提取出：
1. 大家普遍认同的共识
2. 存在分歧的观点及其不同立场
3. 讨论中产生的有价值的新问题

要求：
- 保持绝对中立
- 逻辑严谨
- 信息完整
- 语言简洁明了
`;
  }
}

/**
 * 🔒 内存锁定服务实现
 * 简单的内存级别锁定机制，生产环境建议使用Redis
 */
export class InMemoryLockService implements IDiscussionLockService {
  private locks: Map<string, {
    lockId: string;
    lockedAt: Date;
    expiresAt: Date;
  }> = new Map();

  private readonly DEFAULT_TTL = 10 * 60 * 1000; // 10分钟

  async tryLock(nodeId: EntityId, nodeType: NodeType): Promise<{
    success: boolean;
    lockId?: string;
    message?: string;
  }> {
    const key = `${nodeType}:${nodeId}`;
    const existingLock = this.locks.get(key);

    // 检查现有锁定是否过期
    if (existingLock && existingLock.expiresAt > new Date()) {
      return {
        success: false,
        message: 'Node is already locked'
      };
    }

    // 创建新锁定
    const lockId = `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.DEFAULT_TTL);

    this.locks.set(key, {
      lockId,
      lockedAt: now,
      expiresAt
    });

    return {
      success: true,
      lockId
    };
  }

  async releaseLock(nodeId: EntityId, lockId: string): Promise<void> {
    const keys = Array.from(this.locks.keys()).filter(key => key.includes(nodeId));
    
    for (const key of keys) {
      const lock = this.locks.get(key);

      if (lock && lock.lockId === lockId) {
        this.locks.delete(key);
        break;
      }
    }
  }

  async isLocked(nodeId: EntityId, nodeType: NodeType): Promise<boolean> {
    const key = `${nodeType}:${nodeId}`;
    const lock = this.locks.get(key);
    
    if (!lock) return false;
    
    // 检查是否过期
    if (lock.expiresAt <= new Date()) {
      this.locks.delete(key);

      return false;
    }

    return true;
  }

  async getLockInfo(nodeId: EntityId): Promise<{
    isLocked: boolean;
    lockId?: string;
    lockedAt?: Date;
    expiresAt?: Date;
  }> {
    const keys = Array.from(this.locks.keys()).filter(key => key.includes(nodeId));
    
    if (keys.length === 0) {
      return { isLocked: false };
    }

    const firstKey = keys[0];

    if (!firstKey) {
      return { isLocked: false };
    }

    const lock = this.locks.get(firstKey);

    if (!lock || lock.expiresAt <= new Date()) {
      return { isLocked: false };
    }

    return {
      isLocked: true,
      lockId: lock.lockId,
      lockedAt: lock.lockedAt,
      expiresAt: lock.expiresAt
    };
  }

  async cleanExpiredLocks(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    const entries = Array.from(this.locks.entries());

    for (const [key, lock] of entries) {
      if (lock.expiresAt <= now) {
        this.locks.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

/**
 * 🔔 控制台通知服务实现
 * 简单的控制台输出通知，生产环境建议集成邮件、短信、推送等
 */
export class ConsoleNotificationService implements INotificationService {
  async notifyLoopCompleted(
    loop: WisdomLoop, 
    summary: Summary
  ): Promise<void> {
    console.log(`🎉 智慧回环完成通知:`);
    console.log(`   父节点: ${loop.parentType} ${loop.parentId}`);
    console.log(`   评论数: ${loop.comments.length}`);
    console.log(`   摘要ID: ${summary.id}`);
    console.log(`   摘要内容: ${summary.content.substring(0, 100)}...`);
  }

  async notifyNewComment(
    comment: Comment, 
    recipients?: string[]
  ): Promise<void> {
    console.log(`💬 新评论通知:`);
    console.log(`   评论ID: ${comment.id}`);
    console.log(`   作者: ${comment.author || '匿名'}`);
    console.log(`   内容: ${comment.content.substring(0, 50)}...`);
    if (recipients?.length) {
      console.log(`   通知对象: ${recipients.join(', ')}`);
    }
  }

  async notifySystemStatus(status: {
    type: 'info' | 'warning' | 'error';
    message: string;
    details?: any;
  }): Promise<void> {
    const emoji = status.type === 'error' ? '❌' : 
                 status.type === 'warning' ? '⚠️' : 'ℹ️';
    
    console.log(`${emoji} 系统状态通知: ${status.message}`);
    if (status.details) {
      console.log(`   详情:`, status.details);
    }
  }

  async notifyAIFailure(
    parentId: EntityId, 
    parentType: NodeType, 
    error: Error
  ): Promise<void> {
    console.log(`🤖❌ AI处理失败通知:`);
    console.log(`   节点: ${parentType} ${parentId}`);
    console.log(`   错误: ${error.message}`);
    console.log(`   时间: ${new Date().toISOString()}`);
  }
}

/**
 * 🗄️ 内存缓存服务实现
 * 简单的内存缓存，生产环境建议使用Redis
 */
export class InMemoryCacheService implements ICacheService {
  private cache: Map<string, {
    value: any;
    expiresAt: Date;
  }> = new Map();

  private stats = {
    hits: 0,
    misses: 0
  };

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;

      return null;
    }

    if (item.expiresAt <= new Date()) {
      this.cache.delete(key);
      this.stats.misses++;

      return null;
    }

    this.stats.hits++;

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    const expiresAt = new Date(Date.now() + ttl * 1000);

    this.cache.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let deletedCount = 0;

    const keys = Array.from(this.cache.keys());

    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);

    if (!item) return false;
    
    if (item.expiresAt <= new Date()) {
      this.cache.delete(key);

      return false;
    }

    return true;
  }

  async getStats(): Promise<{
    hitRate: number;
    missRate: number;
    totalKeys: number;
    memoryUsage: number;
  }> {
    const total = this.stats.hits + this.stats.misses;
    
    return {
      hitRate: total > 0 ? this.stats.hits / total : 0,
      missRate: total > 0 ? this.stats.misses / total : 0,
      totalKeys: this.cache.size,
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length
    };
  }
}
