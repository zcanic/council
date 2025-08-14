/**
 * 🎯 Parliament Loop 领域实体定义
 * 基于DDD (Domain Driven Design) 原则的核心业务实体
 */

export type EntityId = string;
export type Timestamp = Date;

/**
 * 讨论状态枚举
 */
export enum DiscussionStatus {
  ACTIVE = 'active',        // 活跃讨论中
  LOCKED = 'locked',        // 已锁定等待AI处理
  COMPLETED = 'completed'   // 已完成处理
}

/**
 * 讨论节点类型
 */
export enum NodeType {
  TOPIC = 'topic',
  SUMMARY = 'summary'
}

/**
 * 基础实体抽象类
 */
export abstract class BaseEntity {
  constructor(
    public readonly id: EntityId,
    public readonly createdAt: Timestamp
  ) {}

  equals(other: BaseEntity): boolean {
    return this.id === other.id;
  }
}

/**
 * 🎯 Topic 实体 - 讨论主题
 * 代表一个讨论话题，是智慧之树的根节点
 */
export class Topic extends BaseEntity {
  constructor(
    id: EntityId,
    public readonly title: string,
    public status: DiscussionStatus,
    createdAt: Timestamp,
    public readonly description?: string
  ) {
    super(id, createdAt);
  }

  /**
   * 锁定话题（当达到评论阈值时）
   */
  lock(): void {
    if (this.status !== DiscussionStatus.ACTIVE) {
      throw new Error(`Cannot lock topic in ${this.status} status`);
    }
    this.status = DiscussionStatus.LOCKED;
  }

  /**
   * 解锁话题（AI处理失败时的恢复机制）
   */
  unlock(): void {
    if (this.status !== DiscussionStatus.LOCKED) {
      throw new Error(`Cannot unlock topic in ${this.status} status`);
    }
    this.status = DiscussionStatus.ACTIVE;
  }

  /**
   * 完成处理（AI成功生成摘要后）
   */
  complete(): void {
    if (this.status !== DiscussionStatus.LOCKED) {
      throw new Error(`Cannot complete topic in ${this.status} status`);
    }
    this.status = DiscussionStatus.COMPLETED;
  }

  /**
   * 检查是否可以接收新评论
   */
  canAcceptComments(): boolean {
    return this.status === DiscussionStatus.ACTIVE;
  }

  static create(title: string, description?: string): Topic {
    return new Topic(
      generateId(),
      title,
      DiscussionStatus.ACTIVE,
      new Date(),
      description
    );
  }
}

/**
 * 💬 Comment 实体 - 评论
 * 代表用户在讨论中的观点
 */
export class Comment extends BaseEntity {
  constructor(
    id: EntityId,
    public readonly content: string,
    public readonly parentId: EntityId,
    public readonly parentType: NodeType,
    createdAt: Timestamp,
    public readonly author?: string
  ) {
    super(id, createdAt);
    this.validate();
  }

  private validate(): void {
    if (!this.content.trim()) {
      throw new Error('Comment content cannot be empty');
    }
    if (this.content.length > 2000) {
      throw new Error('Comment content too long (max 2000 characters)');
    }
  }

  /**
   * 检查评论是否属于指定话题
   */
  belongsToTopic(): boolean {
    return this.parentType === NodeType.TOPIC;
  }

  /**
   * 检查评论是否属于摘要
   */
  belongsToSummary(): boolean {
    return this.parentType === NodeType.SUMMARY;
  }

  static create(
    content: string,
    parentId: EntityId,
    parentType: NodeType,
    author?: string
  ): Comment {
    return new Comment(
      generateId(),
      content,
      parentId,
      parentType,
      new Date(),
      author
    );
  }
}

/**
 * 📋 Summary 实体 - AI摘要
 * 代表AI对一轮讨论的智慧提纯结果
 */
export class Summary extends BaseEntity {
  constructor(
    id: EntityId,
    public readonly content: string,
    public readonly topicId: EntityId,
    public readonly metadata: AISummaryMetadata,
    createdAt: Timestamp,
    public readonly parentId?: EntityId
  ) {
    super(id, createdAt);
  }

  /**
   * 检查是否为顶级摘要（直接来自话题）
   */
  isTopLevel(): boolean {
    return !this.parentId;
  }

  /**
   * 检查是否为嵌套摘要（来自其他摘要）
   */
  isNested(): boolean {
    return !!this.parentId;
  }

  /**
   * 获取摘要的深度层级
   */
  getLevel(): number {
    // 实际实现需要递归查询父摘要
    return this.isTopLevel() ? 1 : 2; // 简化实现
  }

  static create(
    content: string,
    topicId: EntityId,
    metadata: AISummaryMetadata,
    parentId?: EntityId
  ): Summary {
    return new Summary(
      generateId(),
      content,
      topicId,
      metadata,
      new Date(),
      parentId
    );
  }
}

/**
 * 🤖 AI摘要元数据
 */
export interface AISummaryMetadata {
  consensus: string;
  disagreements: Array<{
    point: string;
    views: string[];
  }>;
  new_questions: string[];
  model?: string;
  timestamp?: string;
  confidence_score?: number;
}

/**
 * 🎯 智慧回环 (Wisdom Loop) 值对象
 * 代表一个完整的讨论循环（10条评论 + 1个摘要）
 */
export class WisdomLoop {
  constructor(
    public readonly parentId: EntityId,
    public readonly parentType: NodeType,
    public readonly comments: Comment[],
    public readonly summary?: Summary
  ) {}

  /**
   * 检查回环是否已满（达到评论阈值）
   */
  isFull(): boolean {
    return this.comments.length >= WisdomLoop.COMMENT_THRESHOLD;
  }

  /**
   * 检查回环是否已完成（已有摘要）
   */
  isCompleted(): boolean {
    return !!this.summary;
  }

  /**
   * 获取剩余评论槽位
   */
  getRemainingSlots(): number {
    return Math.max(0, WisdomLoop.COMMENT_THRESHOLD - this.comments.length);
  }

  /**
   * 获取当前轮次进度百分比
   */
  getProgress(): number {
    return (this.comments.length / WisdomLoop.COMMENT_THRESHOLD) * 100;
  }

  static readonly COMMENT_THRESHOLD = 10;
}

/**
 * 🌳 智慧树节点 (Wisdom Tree Node) 值对象
 * 表示智慧树中的一个节点及其子节点
 */
export class WisdomTreeNode {
  constructor(
    public readonly nodeId: EntityId,
    public readonly nodeType: NodeType,
    public readonly content: string,
    public readonly children: WisdomTreeNode[] = [],
    public readonly comments: Comment[] = [],
    public readonly metadata?: any
  ) {}

  /**
   * 检查节点是否为叶子节点
   */
  isLeaf(): boolean {
    return this.children.length === 0;
  }

  /**
   * 获取节点深度
   */
  getDepth(): number {
    if (this.isLeaf()) return 0;

    return Math.max(...this.children.map(child => child.getDepth())) + 1;
  }

  /**
   * 获取节点总评论数（包括子节点）
   */
  getTotalComments(): number {
    const childrenComments = this.children.reduce(
      (sum, child) => sum + child.getTotalComments(),
      0
    );

    return this.comments.length + childrenComments;
  }
}

/**
 * 生成唯一ID的辅助函数
 */
function generateId(): EntityId {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
