/**
 * 🎯 Parliament Loop 领域仓储接口定义
 * 基于Repository模式的数据访问抽象层
 */

import type { 
  Topic, 
  Comment, 
  Summary, 
  WisdomLoop, 
  EntityId, 
  NodeType,
  DiscussionStatus 
} from './entities';

/**
 * 分页查询参数
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * 查询结果分页信息
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 🎯 Topic 仓储接口
 */
export interface ITopicRepository {
  /**
   * 根据ID查找话题
   */
  findById(id: EntityId): Promise<Topic | null>;

  /**
   * 查找所有话题（支持分页和筛选）
   */
  findAll(options?: PaginationOptions & {
    status?: DiscussionStatus;
    titleContains?: string;
  }): Promise<PaginatedResult<Topic>>;

  /**
   * 保存话题
   */
  save(topic: Topic): Promise<void>;

  /**
   * 删除话题
   */
  delete(id: EntityId): Promise<void>;

  /**
   * 更新话题状态
   */
  updateStatus(id: EntityId, status: DiscussionStatus): Promise<void>;

  /**
   * 检查话题是否存在
   */
  exists(id: EntityId): Promise<boolean>;
}

/**
 * 💬 Comment 仓储接口
 */
export interface ICommentRepository {
  /**
   * 根据ID查找评论
   */
  findById(id: EntityId): Promise<Comment | null>;

  /**
   * 根据父节点查找评论
   */
  findByParent(
    parentId: EntityId,
    parentType: NodeType,
    options?: PaginationOptions
  ): Promise<Comment[]>;

  /**
   * 计算父节点下的评论数量
   */
  countByParent(parentId: EntityId, parentType: NodeType): Promise<number>;

  /**
   * 获取最近的N条评论（用于AI摘要）
   */
  getRecentComments(
    parentId: EntityId,
    parentType: NodeType,
    limit: number
  ): Promise<Comment[]>;

  /**
   * 保存评论
   */
  save(comment: Comment): Promise<void>;

  /**
   * 批量保存评论
   */
  saveMany(comments: Comment[]): Promise<void>;

  /**
   * 删除评论
   */
  delete(id: EntityId): Promise<void>;

  /**
   * 根据作者查找评论
   */
  findByAuthor(author: string, options?: PaginationOptions): Promise<Comment[]>;
}

/**
 * 📋 Summary 仓储接口
 */
export interface ISummaryRepository {
  /**
   * 根据ID查找摘要
   */
  findById(id: EntityId): Promise<Summary | null>;

  /**
   * 根据话题ID查找所有摘要
   */
  findByTopicId(topicId: EntityId): Promise<Summary[]>;

  /**
   * 根据父摘要ID查找子摘要
   */
  findByParentId(parentId: EntityId): Promise<Summary[]>;

  /**
   * 查找顶级摘要（直接来自话题）
   */
  findTopLevelByTopicId(topicId: EntityId): Promise<Summary[]>;

  /**
   * 保存摘要
   */
  save(summary: Summary): Promise<void>;

  /**
   * 删除摘要
   */
  delete(id: EntityId): Promise<void>;

  /**
   * 检查摘要是否存在
   */
  exists(id: EntityId): Promise<boolean>;

  /**
   * 获取摘要的完整层级路径
   */
  getHierarchyPath(id: EntityId): Promise<Summary[]>;
}

/**
 * 🎯 智慧回环仓储接口
 * 提供业务级别的聚合查询
 */
export interface IWisdomLoopRepository {
  /**
   * 获取指定父节点的当前智慧回环状态
   */
  getCurrentLoop(parentId: EntityId, parentType: NodeType): Promise<WisdomLoop>;

  /**
   * 获取指定话题的所有完成的智慧回环
   */
  getCompletedLoops(topicId: EntityId): Promise<WisdomLoop[]>;

  /**
   * 检查是否可以开始新的智慧回环
   */
  canStartNewLoop(parentId: EntityId, parentType: NodeType): Promise<boolean>;

  /**
   * 获取智慧回环的统计信息
   */
  getLoopStatistics(topicId: EntityId): Promise<{
    totalLoops: number;
    completedLoops: number;
    totalComments: number;
    averageCommentsPerLoop: number;
  }>;
}

/**
 * 🌳 智慧树仓储接口
 * 提供树形结构的复合查询
 */
export interface IWisdomTreeRepository {
  /**
   * 获取完整的智慧树结构
   */
  getFullTree(topicId: EntityId): Promise<import('./entities').WisdomTreeNode>;

  /**
   * 获取树的某个分支
   */
  getSubTree(nodeId: EntityId, nodeType: NodeType, maxDepth?: number): Promise<import('./entities').WisdomTreeNode>;

  /**
   * 获取树的统计信息
   */
  getTreeStatistics(topicId: EntityId): Promise<{
    totalNodes: number;
    maxDepth: number;
    totalComments: number;
    totalSummaries: number;
  }>;
}

/**
 * 📊 分析查询仓储接口
 * 提供数据分析和报告查询
 */
export interface IAnalyticsRepository {
  /**
   * 获取话题的参与度统计
   */
  getTopicEngagement(topicId: EntityId): Promise<{
    totalParticipants: number;
    averageCommentsPerUser: number;
    mostActiveUsers: Array<{ author: string; commentCount: number }>;
    timeDistribution: Array<{ hour: number; commentCount: number }>;
  }>;

  /**
   * 获取AI摘要质量指标
   */
  getSummaryQualityMetrics(timeRange?: { from: Date; to: Date }): Promise<{
    totalSummaries: number;
    averageResponseTime: number;
    successRate: number;
    averageConfidenceScore: number;
  }>;

  /**
   * 获取系统整体统计
   */
  getSystemStatistics(): Promise<{
    totalTopics: number;
    totalComments: number;
    totalSummaries: number;
    activeTopics: number;
    dailyActiveUsers: number;
  }>;
}

/**
 * 🔄 工作单元 (Unit of Work) 接口
 * 管理事务和聚合根的一致性
 */
export interface IUnitOfWork {
  /**
   * 获取各个仓储实例
   */
  topics: ITopicRepository;
  comments: ICommentRepository;
  summaries: ISummaryRepository;
  wisdomLoops: IWisdomLoopRepository;
  wisdomTree: IWisdomTreeRepository;
  analytics: IAnalyticsRepository;

  /**
   * 开始事务
   */
  begin(): Promise<void>;

  /**
   * 提交事务
   */
  commit(): Promise<void>;

  /**
   * 回滚事务
   */
  rollback(): Promise<void>;

  /**
   * 执行事务（自动管理开始、提交、回滚）
   */
  execute<T>(operation: () => Promise<T>): Promise<T>;
}

/**
 * 仓储工厂接口
 */
export interface IRepositoryFactory {
  createUnitOfWork(): IUnitOfWork;
  createTopicRepository(): ITopicRepository;
  createCommentRepository(): ICommentRepository;
  createSummaryRepository(): ISummaryRepository;
  createWisdomLoopRepository(): IWisdomLoopRepository;
  createWisdomTreeRepository(): IWisdomTreeRepository;
  createAnalyticsRepository(): IAnalyticsRepository;
}
