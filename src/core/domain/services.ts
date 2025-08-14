/**
 * 🎯 Parliament Loop 领域服务接口
 * 封装复杂业务逻辑和跨聚合操作
 */

import type { 
  Topic, 
  Comment, 
  Summary, 
  WisdomLoop, 
  EntityId, 
  NodeType,
  AISummaryMetadata 
} from './entities';

/**
 * 🤖 AI服务接口
 * 抽象AI调用的具体实现
 */
export interface IAIService {
  /**
   * 对评论列表进行智慧提纯
   */
  summarizeComments(comments: Comment[]): Promise<AISummaryMetadata>;

  /**
   * 检查AI服务健康状态
   */
  checkHealth(): Promise<{ isHealthy: boolean; latency?: number; error?: string }>;

  /**
   * 获取AI服务配置信息
   */
  getConfiguration(): Promise<{
    modelName: string;
    maxTokens: number;
    temperature: number;
    responseFormat: string;
  }>;

  /**
   * 验证AI返回结果格式
   */
  validateResponse(response: any): Promise<AISummaryMetadata>;
}

/**
 * 🔒 讨论锁定服务接口
 * 管理讨论的锁定和解锁机制
 */
export interface IDiscussionLockService {
  /**
   * 尝试锁定讨论节点
   */
  tryLock(nodeId: EntityId, nodeType: NodeType): Promise<{
    success: boolean;
    lockId?: string;
    message?: string;
  }>;

  /**
   * 释放讨论锁定
   */
  releaseLock(nodeId: EntityId, lockId: string): Promise<void>;

  /**
   * 检查节点是否被锁定
   */
  isLocked(nodeId: EntityId, nodeType: NodeType): Promise<boolean>;

  /**
   * 获取锁定信息
   */
  getLockInfo(nodeId: EntityId): Promise<{
    isLocked: boolean;
    lockId?: string;
    lockedAt?: Date;
    expiresAt?: Date;
  }>;

  /**
   * 清理过期锁定
   */
  cleanExpiredLocks(): Promise<number>;
}

/**
 * 📊 智慧回环管理服务接口
 * 处理智慧回环的生命周期管理
 */
export interface IWisdomLoopService {
  /**
   * 检查评论是否触发智慧提纯
   */
  shouldTriggerWisdomDistillation(
    parentId: EntityId, 
    parentType: NodeType
  ): Promise<boolean>;

  /**
   * 计算当前回环状态
   */
  getCurrentLoopStatus(
    parentId: EntityId, 
    parentType: NodeType
  ): Promise<{
    commentCount: number;
    remainingSlots: number;
    progress: number;
    isReady: boolean;
  }>;

  /**
   * 开始新的智慧回环
   */
  startNewLoop(
    parentId: EntityId, 
    parentType: NodeType
  ): Promise<WisdomLoop>;

  /**
   * 完成智慧回环（生成摘要后）
   */
  completeLoop(
    parentId: EntityId, 
    parentType: NodeType, 
    summary: Summary
  ): Promise<WisdomLoop>;

  /**
   * 获取回环历史记录
   */
  getLoopHistory(topicId: EntityId): Promise<WisdomLoop[]>;
}

/**
 * 🌳 智慧树构建服务接口
 * 构建和维护智慧树结构
 */
export interface IWisdomTreeService {
  /**
   * 构建完整的智慧树
   */
  buildWisdomTree(topicId: EntityId): Promise<import('./entities').WisdomTreeNode>;

  /**
   * 添加新节点到智慧树
   */
  addNode(
    parentId: EntityId, 
    parentType: NodeType, 
    content: Comment | Summary
  ): Promise<void>;

  /**
   * 移除节点及其子树
   */
  removeNode(nodeId: EntityId, nodeType: NodeType): Promise<void>;

  /**
   * 重新构建树结构（修复不一致）
   */
  rebuildTree(topicId: EntityId): Promise<import('./entities').WisdomTreeNode>;

  /**
   * 验证树结构的完整性
   */
  validateTreeIntegrity(topicId: EntityId): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;

  /**
   * 获取树的路径（从根到指定节点）
   */
  getPathToNode(
    nodeId: EntityId, 
    nodeType: NodeType
  ): Promise<Array<{ id: EntityId; type: NodeType; title: string }>>;
}

/**
 * 📈 内容分析服务接口
 * 分析评论和摘要的质量和趋势
 */
export interface IContentAnalysisService {
  /**
   * 分析评论质量
   */
  analyzeCommentQuality(comment: Comment): Promise<{
    score: number;
    factors: {
      length: number;
      complexity: number;
      sentiment: number;
      relevance: number;
    };
    suggestions: string[];
  }>;

  /**
   * 分析摘要质量
   */
  analyzeSummaryQuality(summary: Summary): Promise<{
    score: number;
    factors: {
      coherence: number;
      completeness: number;
      neutrality: number;
      actionability: number;
    };
    metrics: {
      consensusClarity: number;
      disagreementCoverage: number;
      questionRelevance: number;
    };
  }>;

  /**
   * 检测内容相似性
   */
  detectSimilarity(content1: string, content2: string): Promise<{
    similarityScore: number;
    commonPhrases: string[];
    isDuplicate: boolean;
  }>;

  /**
   * 生成内容标签
   */
  generateTags(content: string): Promise<string[]>;

  /**
   * 提取关键概念
   */
  extractKeyConcepts(comments: Comment[]): Promise<Array<{
    concept: string;
    frequency: number;
    sentiment: number;
  }>>;
}

/**
 * 🔔 通知服务接口
 * 管理各种业务事件的通知
 */
export interface INotificationService {
  /**
   * 发送智慧回环完成通知
   */
  notifyLoopCompleted(loop: WisdomLoop, summary: Summary): Promise<void>;

  /**
   * 发送新评论通知
   */
  notifyNewComment(comment: Comment, recipients?: string[]): Promise<void>;

  /**
   * 发送系统状态通知
   */
  notifySystemStatus(status: {
    type: 'info' | 'warning' | 'error';
    message: string;
    details?: any;
  }): Promise<void>;

  /**
   * 发送AI处理失败通知
   */
  notifyAIFailure(
    parentId: EntityId, 
    parentType: NodeType, 
    error: Error
  ): Promise<void>;
}

/**
 * 📊 缓存服务接口
 * 优化性能的缓存层
 */
export interface ICacheService {
  /**
   * 获取缓存值
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * 设置缓存值
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * 删除缓存
   */
  delete(key: string): Promise<void>;

  /**
   * 批量删除缓存（通过模式匹配）
   */
  deleteByPattern(pattern: string): Promise<number>;

  /**
   * 检查缓存是否存在
   */
  exists(key: string): Promise<boolean>;

  /**
   * 获取缓存统计信息
   */
  getStats(): Promise<{
    hitRate: number;
    missRate: number;
    totalKeys: number;
    memoryUsage: number;
  }>;
}

/**
 * ⏰ 调度服务接口
 * 管理后台任务和定时作业
 */
export interface ISchedulerService {
  /**
   * 调度AI摘要任务
   */
  scheduleAISummarization(
    parentId: EntityId,
    parentType: NodeType,
    priority: 'low' | 'normal' | 'high',
    delay?: number
  ): Promise<{ taskId: string; scheduledAt: Date }>;

  /**
   * 取消任务
   */
  cancelTask(taskId: string): Promise<boolean>;

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId: string): Promise<{
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress?: number;
    result?: any;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
  }>;

  /**
   * 调度定期清理任务
   */
  scheduleCleanupTasks(): Promise<void>;

  /**
   * 获取队列统计
   */
  getQueueStats(): Promise<{
    pending: number;
    running: number;
    completed: number;
    failed: number;
  }>;
}

/**
 * 🔍 搜索服务接口
 * 提供全文搜索和智能查询
 */
export interface ISearchService {
  /**
   * 搜索话题
   */
  searchTopics(query: string, options?: {
    status?: string[];
    dateRange?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  }): Promise<{
    topics: Topic[];
    totalCount: number;
    suggestions: string[];
  }>;

  /**
   * 搜索评论
   */
  searchComments(query: string, options?: {
    topicIds?: EntityId[];
    authors?: string[];
    dateRange?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  }): Promise<{
    comments: Comment[];
    totalCount: number;
    highlights: Array<{ commentId: EntityId; snippet: string }>;
  }>;

  /**
   * 搜索摘要
   */
  searchSummaries(query: string, options?: {
    topicIds?: EntityId[];
    dateRange?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  }): Promise<{
    summaries: Summary[];
    totalCount: number;
    relatedConcepts: string[];
  }>;

  /**
   * 智能推荐相关内容
   */
  getRecommendations(
    contextId: EntityId,
    contextType: NodeType,
    maxResults?: number
  ): Promise<{
    topics: Topic[];
    summaries: Summary[];
    comments: Comment[];
  }>;
}

/**
 * 🛡️ 安全服务接口
 * 处理内容审核和安全检查
 */
export interface ISecurityService {
  /**
   * 内容审核
   */
  moderateContent(content: string): Promise<{
    isAppropriate: boolean;
    confidence: number;
    issues: string[];
    filteredContent?: string;
  }>;

  /**
   * 检测垃圾内容
   */
  detectSpam(content: string, author?: string): Promise<{
    isSpam: boolean;
    confidence: number;
    reasons: string[];
  }>;

  /**
   * 验证用户输入
   */
  validateInput(input: any, schema: any): Promise<{
    isValid: boolean;
    errors: string[];
    sanitizedInput?: any;
  }>;

  /**
   * 记录安全事件
   */
  logSecurityEvent(event: {
    type: 'content_moderation' | 'spam_detection' | 'validation_failure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: any;
    userId?: string;
  }): Promise<void>;
}
