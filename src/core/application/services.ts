/**
 * 🎯 Parliament Loop 应用服务 - 智慧回环核心用例
 * 编排领域服务，实现完整的业务用例
 */

import { 
  Topic, 
  Comment, 
  Summary, 
  NodeType,
  DiscussionStatus 
} from '../domain/entities';
import type { 
  EntityId
} from '../domain/entities';
import type { 
  IUnitOfWork,
  ITopicRepository,
  ICommentRepository,
  ISummaryRepository,
  IWisdomLoopRepository
} from '../domain/repositories';
import type {
  IAIService,
  IDiscussionLockService,
  IWisdomLoopService,
  INotificationService,
  ICacheService,
  ISchedulerService,
  IContentAnalysisService,
  ISecurityService
} from '../domain/services';

/**
 * 创建评论的输入DTO
 */
export interface CreateCommentCommand {
  content: string;
  author?: string;
  parentId: EntityId;
  parentType: NodeType;
}

/**
 * 创建话题的输入DTO
 */
export interface CreateTopicCommand {
  title: string;
  description?: string;
  author?: string;
}

/**
 * 智慧回环处理结果
 */
export interface WisdomLoopResult {
  comment: Comment;
  triggered: boolean;
  loopStatus: {
    commentCount: number;
    remainingSlots: number;
    progress: number;
    isCompleted: boolean;
  };
  summary?: Summary;
}

/**
 * 🎯 智慧回环应用服务
 * 核心业务用例的协调器
 */
export class WisdomLoopApplicationService {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly aiService: IAIService,
    private readonly lockService: IDiscussionLockService,
    private readonly wisdomLoopService: IWisdomLoopService,
    private readonly notificationService: INotificationService,
    private readonly cacheService: ICacheService,
    private readonly schedulerService: ISchedulerService,
    private readonly contentAnalysisService: IContentAnalysisService,
    private readonly securityService: ISecurityService
  ) {}

  /**
   * 🎯 创建评论并处理智慧回环
   * 核心用例：用户发表评论，系统自动处理智慧提纯
   */
  async createCommentAndProcessLoop(command: CreateCommentCommand): Promise<WisdomLoopResult> {
    // 1. 输入验证和安全检查
    await this.validateAndSecureInput(command);

    // 2. 检查父节点状态和权限
    await this.validateParentNode(command.parentId, command.parentType);

    let result: WisdomLoopResult;

    // 3. 执行原子性事务
    await this.unitOfWork.execute(async () => {
      // 3.1 创建评论
      const comment = Comment.create(
        command.content,
        command.parentId,
        command.parentType,
        command.author
      );

      await this.unitOfWork.comments.save(comment);

      // 3.2 检查是否触发智慧提纯
      const shouldTrigger = await this.wisdomLoopService.shouldTriggerWisdomDistillation(
        command.parentId,
        command.parentType
      );

      // 3.3 获取当前回环状态
      const loopStatus = await this.wisdomLoopService.getCurrentLoopStatus(
        command.parentId,
        command.parentType
      );

      result = {
        comment,
        triggered: shouldTrigger,
        loopStatus: {
          ...loopStatus,
          isCompleted: false // 添加缺失的属性
        },
        summary: undefined
      };

      // 3.4 如果触发智慧提纯，立即锁定并调度AI处理
      if (shouldTrigger && command.parentType === NodeType.TOPIC) {
        await this.triggerWisdomDistillation(command.parentId, command.parentType);
      }
    });

    // 4. 异步处理（不阻塞用户响应）
    if (result!.triggered) {
      this.processWisdomDistillationInBackground(
        command.parentId, 
        command.parentType
      ).catch(error => {
        console.error('Background wisdom distillation failed:', error);
        this.handleDistillationFailure(command.parentId, command.parentType, error);
      });
    }

    // 5. 发送通知
    await this.notificationService.notifyNewComment(result!.comment);

    // 6. 清理相关缓存
    await this.invalidateRelatedCaches(command.parentId, command.parentType);

    return result!;
  }

  /**
   * 🎯 创建新话题
   */
  async createTopic(command: CreateTopicCommand): Promise<Topic> {
    // 1. 输入验证
    await this.securityService.validateInput(command, {
      title: { required: true, maxLength: 255 },
      description: { maxLength: 2000 }
    });

    // 2. 内容审核
    const moderation = await this.securityService.moderateContent(
      `${command.title} ${command.description || ''}`
    );

    if (!moderation.isAppropriate) {
      throw new Error('Content violates community guidelines');
    }

    // 3. 创建并保存话题
    const topic = Topic.create(command.title, command.description);
    
    await this.unitOfWork.execute(async () => {
      await this.unitOfWork.topics.save(topic);
    });

    // 4. 缓存新话题
    const cacheKey = `topic:${topic.id}`;

    await this.cacheService.set(cacheKey, topic, 3600); // 1小时缓存

    return topic;
  }

  /**
   * 🎯 获取智慧树结构
   */
  async getWisdomTree(topicId: EntityId): Promise<import('../domain/entities').WisdomTreeNode> {
    // 1. 检查缓存
    const cacheKey = `wisdom_tree:${topicId}`;
    const cached = await this.cacheService.get<import('../domain/entities').WisdomTreeNode>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // 2. 构建智慧树
    const tree = await this.unitOfWork.wisdomTree.getFullTree(topicId);

    // 3. 缓存结果
    await this.cacheService.set(cacheKey, tree, 1800); // 30分钟缓存

    return tree;
  }

  /**
   * 🎯 获取回环统计信息
   */
  async getLoopStatistics(topicId: EntityId): Promise<any> {
    const cacheKey = `loop_stats:${topicId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const stats = await this.unitOfWork.wisdomLoops.getLoopStatistics(topicId);

    await this.cacheService.set(cacheKey, stats, 600); // 10分钟缓存

    return stats;
  }

  /**
   * 🔒 私有方法：输入验证和安全检查
   */
  private async validateAndSecureInput(command: CreateCommentCommand): Promise<void> {
    // 输入格式验证
    const validation = await this.securityService.validateInput(command, {
      content: { required: true, minLength: 1, maxLength: 2000 },
      parentId: { required: true },
      parentType: { required: true, enum: [NodeType.TOPIC, NodeType.SUMMARY] }
    });

    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }

    // 内容审核
    const moderation = await this.securityService.moderateContent(command.content);

    if (!moderation.isAppropriate) {
      throw new Error(`Content moderation failed: ${moderation.issues.join(', ')}`);
    }

    // 垃圾检测
    const spamDetection = await this.securityService.detectSpam(
      command.content, 
      command.author
    );

    if (spamDetection.isSpam) {
      throw new Error(`Spam detected: ${spamDetection.reasons.join(', ')}`);
    }
  }

  /**
   * 🔒 私有方法：验证父节点状态
   */
  private async validateParentNode(parentId: EntityId, parentType: NodeType): Promise<void> {
    if (parentType === NodeType.TOPIC) {
      const topic = await this.unitOfWork.topics.findById(parentId);

      if (!topic) {
        throw new Error('Topic not found');
      }
      if (!topic.canAcceptComments()) {
        throw new Error('Topic is locked and cannot accept new comments');
      }
    } else {
      const summary = await this.unitOfWork.summaries.findById(parentId);

      if (!summary) {
        throw new Error('Summary not found');
      }
    }
  }

  /**
   * 🔒 私有方法：触发智慧提纯（锁定话题）
   */
  private async triggerWisdomDistillation(parentId: EntityId, parentType: NodeType): Promise<void> {
    if (parentType === NodeType.TOPIC) {
      // 原子性锁定
      const lockResult = await this.lockService.tryLock(parentId, parentType);

      if (!lockResult.success) {
        throw new Error(`Failed to lock topic: ${lockResult.message}`);
      }

      // 更新话题状态
      await this.unitOfWork.topics.updateStatus(parentId, DiscussionStatus.LOCKED);
      
      console.log(`🔒 Topic ${parentId} locked for wisdom distillation`);
    }
  }

  /**
   * 🔒 私有方法：后台处理智慧提纯
   */
  private async processWisdomDistillationInBackground(
    parentId: EntityId, 
    parentType: NodeType
  ): Promise<void> {
    try {
      console.log(`🤖 Starting background wisdom distillation for ${parentType} ${parentId}`);

      // 1. 获取要提纯的评论
      const comments = await this.unitOfWork.comments.getRecentComments(
        parentId,
        parentType,
        10 // WisdomLoop.COMMENT_THRESHOLD
      );

      if (comments.length === 0) {
        console.warn(`No comments found for ${parentType} ${parentId}`);

        return;
      }

      // 2. 质量预检
      const qualityChecks = await Promise.all(
        comments.map(comment => this.contentAnalysisService.analyzeCommentQuality(comment))
      );

      const averageQuality = qualityChecks.reduce((sum, check) => sum + check.score, 0) / qualityChecks.length;

      console.log(`📊 Average comment quality: ${averageQuality}`);

      // 3. 调用AI进行智慧提纯
      console.log('🔄 Calling AI service for wisdom distillation...');
      const startTime = Date.now();
      
      const aiSummary = await this.aiService.summarizeComments(comments);
      
      const duration = Date.now() - startTime;

      console.log(`✅ AI distillation completed in ${duration}ms`);

      // 4. 创建摘要实体
      const topic = await this.unitOfWork.topics.findById(
        parentType === NodeType.TOPIC ? parentId : 
        (await this.unitOfWork.summaries.findById(parentId))!.topicId
      );

      const summary = Summary.create(
        aiSummary.consensus,
        topic!.id,
        aiSummary,
        parentType === NodeType.SUMMARY ? parentId : undefined
      );

      // 5. 保存摘要并更新状态
      await this.unitOfWork.execute(async () => {
        await this.unitOfWork.summaries.save(summary);
        
        if (parentType === NodeType.TOPIC) {
          await this.unitOfWork.topics.updateStatus(parentId, DiscussionStatus.COMPLETED);
        }
      });

      // 6. 分析摘要质量
      const summaryQuality = await this.contentAnalysisService.analyzeSummaryQuality(summary);

      console.log(`📊 Summary quality score: ${summaryQuality.score}`);

      // 7. 完成回环
      await this.wisdomLoopService.completeLoop(parentId, parentType, summary);

      // 8. 发送完成通知
      const loop = await this.unitOfWork.wisdomLoops.getCurrentLoop(parentId, parentType);

      await this.notificationService.notifyLoopCompleted(loop, summary);

      // 9. 释放锁定
      if (parentType === NodeType.TOPIC) {
        await this.lockService.releaseLock(parentId, 'wisdom-distillation');
      }

      console.log(`🎉 Wisdom distillation completed successfully for ${parentType} ${parentId}`);

    } catch (error) {
      console.error(`❌ Wisdom distillation failed for ${parentType} ${parentId}:`, error);
      throw error;
    }
  }

  /**
   * 🔒 私有方法：处理提纯失败
   */
  private async handleDistillationFailure(
    parentId: EntityId, 
    parentType: NodeType, 
    error: Error
  ): Promise<void> {
    try {
      // 1. 解锁话题
      if (parentType === NodeType.TOPIC) {
        await this.unitOfWork.topics.updateStatus(parentId, DiscussionStatus.ACTIVE);
        await this.lockService.releaseLock(parentId, 'wisdom-distillation');
        console.log(`🔓 Topic ${parentId} unlocked due to distillation failure`);
      }

      // 2. 发送失败通知
      await this.notificationService.notifyAIFailure(parentId, parentType, error);

      // 3. 记录安全事件（如果是安全相关错误）
      await this.securityService.logSecurityEvent({
        type: 'validation_failure',
        severity: 'medium',
        details: {
          parentId,
          parentType,
          error: error.message,
          timestamp: new Date()
        }
      });

      // 4. 调度重试任务（可选）
      await this.schedulerService.scheduleAISummarization(
        parentId,
        parentType,
        'low',
        300000 // 5分钟后重试
      );

    } catch (recoveryError) {
      console.error(`Failed to handle distillation failure:`, recoveryError);
    }
  }

  /**
   * 🔒 私有方法：清理相关缓存
   */
  private async invalidateRelatedCaches(parentId: EntityId, parentType: NodeType): Promise<void> {
    const patterns = [
      `wisdom_tree:*`,
      `loop_stats:*`,
      `comment:${parentId}:*`,
      `${parentType}:${parentId}`
    ];

    for (const pattern of patterns) {
      await this.cacheService.deleteByPattern(pattern);
    }
  }
}

/**
 * 🎯 查询应用服务
 * 处理只读查询操作
 */
export class QueryApplicationService {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly cacheService: ICacheService
  ) {}

  /**
   * 获取话题详情
   */
  async getTopicDetails(topicId: EntityId): Promise<{
    topic: Topic;
    comments: Comment[];
    summaries: Summary[];
    statistics: any;
  }> {
    const cacheKey = `topic_details:${topicId}`;
    const cached = await this.cacheService.get<{
      topic: Topic;
      comments: Comment[];
      summaries: Summary[];
      statistics: any;
    }>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const [topic, comments, summaries, statistics] = await Promise.all([
      this.unitOfWork.topics.findById(topicId),
      this.unitOfWork.comments.findByParent(topicId, NodeType.TOPIC),
      this.unitOfWork.summaries.findByTopicId(topicId),
      this.unitOfWork.wisdomLoops.getLoopStatistics(topicId)
    ]);

    if (!topic) {
      throw new Error('Topic not found');
    }

    const result = { topic, comments, summaries, statistics };

    await this.cacheService.set(cacheKey, result, 600); // 10分钟缓存

    return result;
  }

  /**
   * 获取所有话题列表
   */
  async getTopicList(options?: any): Promise<any> {
    return this.unitOfWork.topics.findAll(options);
  }
}
