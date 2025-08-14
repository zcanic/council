/**
 * 🎯 Parliament Loop 基础设施层 - Prisma仓储实现
 * 实现领域仓储接口，使用Prisma ORM
 */

import { PrismaClient } from '@prisma/client';

import { 
  Topic, 
  Comment, 
  Summary, 
  WisdomLoop,
  NodeType,
  DiscussionStatus 
} from '../domain/entities';
import type { 
  EntityId
} from '../domain/entities';
import type {
  ITopicRepository,
  ICommentRepository,
  ISummaryRepository,
  IWisdomLoopRepository,
  IWisdomTreeRepository,
  IAnalyticsRepository,
  IUnitOfWork,
  PaginationOptions,
  PaginatedResult
} from '../domain/repositories';

/**
 * 🎯 Prisma Topic 仓储实现
 */
export class PrismaTopicRepository implements ITopicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: EntityId): Promise<Topic | null> {
    const record = await this.prisma.topic.findUnique({
      where: { id }
    });

    if (!record) return null;

    return this.toDomainEntity(record);
  }

  async findAll(options?: PaginationOptions & {
    status?: DiscussionStatus;
    titleContains?: string;
  }): Promise<PaginatedResult<Topic>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      sortDirection = 'desc',
      status,
      titleContains
    } = options || {};

    const where: any = {};

    if (status) where.status = status;
    if (titleContains) {
      where.title = {
        contains: titleContains,
        mode: 'insensitive'
      };
    }

    const [records, totalCount] = await Promise.all([
      this.prisma.topic.findMany({
        where,
        orderBy: { [orderBy]: sortDirection },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.topic.count({ where })
    ]);

    const topics = records.map(record => this.toDomainEntity(record));
    const totalPages = Math.ceil(totalCount / limit);

    return {
      items: topics,
      totalCount,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };
  }

  async save(topic: Topic): Promise<void> {
    const data = {
      id: topic.id,
      title: topic.title,
      status: topic.status,
      createdAt: topic.createdAt
    };

    await this.prisma.topic.upsert({
      where: { id: topic.id },
      create: data,
      update: { status: topic.status }
    });
  }

  async delete(id: EntityId): Promise<void> {
    await this.prisma.topic.delete({
      where: { id }
    });
  }

  async updateStatus(id: EntityId, status: DiscussionStatus): Promise<void> {
    await this.prisma.topic.update({
      where: { id },
      data: { status }
    });
  }

  async exists(id: EntityId): Promise<boolean> {
    const count = await this.prisma.topic.count({
      where: { id }
    });

    return count > 0;
  }

  private toDomainEntity(record: any): Topic {
    return new (Topic as any)(
      record.id,
      record.title,
      record.status,
      record.createdAt
    );
  }
}

/**
 * 💬 Prisma Comment 仓储实现
 */
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: EntityId): Promise<Comment | null> {
    const record = await this.prisma.comment.findUnique({
      where: { id }
    });

    if (!record) return null;

    return this.toDomainEntity(record);
  }

  async findByParent(
    parentId: EntityId,
    parentType: NodeType,
    options?: PaginationOptions
  ): Promise<Comment[]> {
    const {
      page = 1,
      limit = 50,
      orderBy = 'createdAt',
      sortDirection = 'asc'
    } = options || {};

    const where: any = {};

    if (parentType === NodeType.TOPIC) {
      where.topicId = parentId;
    } else {
      where.summaryId = parentId;
    }

    const records = await this.prisma.comment.findMany({
      where,
      orderBy: { [orderBy]: sortDirection },
      skip: (page - 1) * limit,
      take: limit
    });

    return records.map(record => this.toDomainEntity(record));
  }

  async countByParent(parentId: EntityId, parentType: NodeType): Promise<number> {
    const where: any = {};

    if (parentType === NodeType.TOPIC) {
      where.topicId = parentId;
    } else {
      where.summaryId = parentId;
    }

    return this.prisma.comment.count({ where });
  }

  async getRecentComments(
    parentId: EntityId,
    parentType: NodeType,
    limit: number
  ): Promise<Comment[]> {
    return this.findByParent(parentId, parentType, {
      page: 1,
      limit,
      orderBy: 'createdAt',
      sortDirection: 'asc'
    });
  }

  async save(comment: Comment): Promise<void> {
    const data = {
      id: comment.id,
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt,
      topicId: comment.parentType === NodeType.TOPIC ? comment.parentId : null,
      summaryId: comment.parentType === NodeType.SUMMARY ? comment.parentId : null
    };

    await this.prisma.comment.upsert({
      where: { id: comment.id },
      create: data,
      update: data
    });
  }

  async saveMany(comments: Comment[]): Promise<void> {
    const data = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt,
      topicId: comment.parentType === NodeType.TOPIC ? comment.parentId : null,
      summaryId: comment.parentType === NodeType.SUMMARY ? comment.parentId : null
    }));

    await this.prisma.comment.createMany({
      data,
      skipDuplicates: true
    });
  }

  async delete(id: EntityId): Promise<void> {
    await this.prisma.comment.delete({
      where: { id }
    });
  }

  async findByAuthor(author: string, options?: PaginationOptions): Promise<Comment[]> {
    const {
      page = 1,
      limit = 50,
      orderBy = 'createdAt',
      sortDirection = 'desc'
    } = options || {};

    const records = await this.prisma.comment.findMany({
      where: { author },
      orderBy: { [orderBy]: sortDirection },
      skip: (page - 1) * limit,
      take: limit
    });

    return records.map(record => this.toDomainEntity(record));
  }

  private toDomainEntity(record: any): Comment {
    const parentType = record.topicId ? NodeType.TOPIC : NodeType.SUMMARY;
    const parentId = record.topicId || record.summaryId;

    return new (Comment as any)(
      record.id,
      record.content,
      parentId,
      parentType,
      record.createdAt,
      record.author
    );
  }
}

/**
 * 📋 Prisma Summary 仓储实现
 */
export class PrismaSummaryRepository implements ISummaryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: EntityId): Promise<Summary | null> {
    const record = await this.prisma.summary.findUnique({
      where: { id }
    });

    if (!record) return null;

    return this.toDomainEntity(record);
  }

  async findByTopicId(topicId: EntityId): Promise<Summary[]> {
    const records = await this.prisma.summary.findMany({
      where: { topicId },
      orderBy: { createdAt: 'asc' }
    });

    return records.map(record => this.toDomainEntity(record));
  }

  async findByParentId(parentId: EntityId): Promise<Summary[]> {
    const records = await this.prisma.summary.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' }
    });

    return records.map(record => this.toDomainEntity(record));
  }

  async findTopLevelByTopicId(topicId: EntityId): Promise<Summary[]> {
    const records = await this.prisma.summary.findMany({
      where: { 
        topicId,
        parentId: null 
      },
      orderBy: { createdAt: 'asc' }
    });

    return records.map(record => this.toDomainEntity(record));
  }

  async save(summary: Summary): Promise<void> {
    const data: any = {
      id: summary.id,
      content: summary.content,
      metadata: summary.metadata as any,
      topicId: summary.topicId,
      parentId: summary.parentId || null,
      createdAt: summary.createdAt
    };

    await this.prisma.summary.upsert({
      where: { id: summary.id },
      create: data,
      update: {
        content: data.content,
        metadata: data.metadata
      }
    });
  }

  async delete(id: EntityId): Promise<void> {
    await this.prisma.summary.delete({
      where: { id }
    });
  }

  async exists(id: EntityId): Promise<boolean> {
    const count = await this.prisma.summary.count({
      where: { id }
    });

    return count > 0;
  }

  async getHierarchyPath(id: EntityId): Promise<Summary[]> {
    const path: Summary[] = [];
    let currentId: EntityId | null = id;

    while (currentId) {
      const summary = await this.findById(currentId);

      if (!summary) break;
      
      path.unshift(summary);
      currentId = summary.parentId || null;
    }

    return path;
  }

  private toDomainEntity(record: any): Summary {
    return new (Summary as any)(
      record.id,
      record.content,
      record.topicId,
      record.metadata,
      record.createdAt,
      record.parentId
    );
  }
}

/**
 * 🔄 Prisma 工作单元实现
 */
export class PrismaUnitOfWork implements IUnitOfWork {
  public readonly topics: ITopicRepository;
  public readonly comments: ICommentRepository;
  public readonly summaries: ISummaryRepository;
  public readonly wisdomLoops: IWisdomLoopRepository;
  public readonly wisdomTree: IWisdomTreeRepository;
  public readonly analytics: IAnalyticsRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.topics = new PrismaTopicRepository(prisma);
    this.comments = new PrismaCommentRepository(prisma);
    this.summaries = new PrismaSummaryRepository(prisma);
    // TODO: 实现其他仓储
    this.wisdomLoops = {} as IWisdomLoopRepository;
    this.wisdomTree = {} as IWisdomTreeRepository;
    this.analytics = {} as IAnalyticsRepository;
  }

  async begin(): Promise<void> {
    // Prisma 会自动管理事务
  }

  async commit(): Promise<void> {
    // Prisma 会自动管理事务
  }

  async rollback(): Promise<void> {
    // Prisma 会自动管理事务
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async () => {
      return operation();
    });
  }
}
