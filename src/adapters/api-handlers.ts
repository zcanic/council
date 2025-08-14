/**
 * 🎯 Parliament Loop 重构后的适配器层
 * 将重构后的核心服务与现有API路由集成
 */

import { NextRequest, NextResponse } from 'next/server';

import type { 
  CreateCommentCommand, 
  CreateTopicCommand 
} from '../core/application/services';
import { GlobalContainer } from '../core/container';
import { NodeType } from '../core/domain/entities';

/**
 * 🔧 API错误处理
 */
class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * 🎯 重构后的评论API处理器
 */
export async function handleCreateComment(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. 解析请求体
    const body = await request.json();
    const { content, author, parentId, parentType } = body;

    // 2. 输入验证
    if (!content || !parentId || !parentType) {
      throw new APIError('Missing required fields', 400, 'MISSING_FIELDS');
    }

    if (!['topic', 'summary'].includes(parentType)) {
      throw new APIError('Invalid parentType', 400, 'INVALID_PARENT_TYPE');
    }

    // 3. 构建命令对象
    const command: CreateCommentCommand = {
      content: content.trim(),
      author: author?.trim(),
      parentId,
      parentType: parentType === 'topic' ? NodeType.TOPIC : NodeType.SUMMARY
    };

    // 4. 获取应用服务
    const container = GlobalContainer.getInstance();
    const wisdomLoopService = container.getWisdomLoopService();

    // 5. 执行业务逻辑
    const result = await wisdomLoopService.createCommentAndProcessLoop(command);

    // 6. 构造响应
    const responseData = {
      success: true,
      data: {
        comment: {
          id: result.comment.id,
          content: result.comment.content,
          author: result.comment.author,
          parentId: result.comment.parentId,
          parentType: result.comment.parentType,
          createdAt: result.comment.createdAt.toISOString()
        },
        loopStatus: result.loopStatus,
        wisdomTriggered: result.triggered,
        summary: result.summary ? {
          id: result.summary.id,
          content: result.summary.content,
          metadata: result.summary.metadata,
          createdAt: result.summary.createdAt.toISOString()
        } : null
      },
      message: result.triggered 
        ? '评论已提交，智慧提纯已触发' 
        : '评论已提交'
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Create comment error:', error);
    
    if (error instanceof APIError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      }, { status: error.statusCode });
    }

    // 业务逻辑错误处理
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('locked')) {
      return NextResponse.json({
        error: 'Topic is currently being processed. Please try again.',
        code: 'TOPIC_LOCKED'
      }, { status: 423 });
    }

    if (errorMessage.includes('not found')) {
      return NextResponse.json({
        error: 'Topic not found',
        code: 'TOPIC_NOT_FOUND'
      }, { status: 404 });
    }

    if (errorMessage.includes('moderation')) {
      return NextResponse.json({
        error: 'Comment violates community guidelines',
        code: 'CONTENT_MODERATION'
      }, { status: 400 });
    }

    // 通用服务器错误
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误，请稍后重试'
      }
    }, { status: 500 });
  }
}

/**
 * 🎯 重构后的话题API处理器
 */
export async function handleCreateTopic(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. 解析请求体
    const body = await request.json();
    const { title, description, author } = body;

    // 2. 输入验证
    if (!title?.trim()) {
      throw new APIError('Title is required', 400, 'MISSING_TITLE');
    }

    // 3. 构建命令对象
    const command: CreateTopicCommand = {
      title: title.trim(),
      description: description?.trim(),
      author: author?.trim()
    };

    // 4. 获取应用服务
    const container = GlobalContainer.getInstance();
    const wisdomLoopService = container.getWisdomLoopService();

    // 5. 执行业务逻辑
    const topic = await wisdomLoopService.createTopic(command);

    // 6. 构造响应
    const responseData = {
      success: true,
      data: {
        topic: {
          id: topic.id,
          title: topic.title,
          status: topic.status,
          createdAt: topic.createdAt.toISOString()
        }
      },
      message: '话题创建成功'
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error: unknown) {
    console.error('Create topic error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (error instanceof APIError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      }, { status: error.statusCode });
    }

    if (errorMessage.includes('community guidelines')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CONTENT_VIOLATION',
          message: '内容违反社区准则'
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误，请稍后重试'
      }
    }, { status: 500 });
  }
}

/**
 * 🔍 获取话题详情处理器
 */
export async function handleGetTopic(
  request: NextRequest, 
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    if (!id) {
      throw new APIError('Topic ID is required', 400, 'MISSING_ID');
    }

    // 获取查询服务
    const container = GlobalContainer.getInstance();
    const queryService = container.getQueryService();

    // 执行查询
    const result = await queryService.getTopicDetails(id);

    // 构造响应
    const responseData = {
      success: true,
      data: {
        topic: {
          id: result.topic.id,
          title: result.topic.title,
          status: result.topic.status,
          createdAt: result.topic.createdAt.toISOString()
        },
        comments: result.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          author: comment.author,
          parentId: comment.parentId,
          parentType: comment.parentType,
          createdAt: comment.createdAt.toISOString()
        })),
        summaries: result.summaries.map(summary => ({
          id: summary.id,
          content: summary.content,
          metadata: summary.metadata,
          parentId: summary.parentId,
          createdAt: summary.createdAt.toISOString()
        })),
        statistics: result.statistics
      }
    };

    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error('Get topic error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (error instanceof APIError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      }, { status: error.statusCode });
    }

    if (errorMessage.includes('not found')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'TOPIC_NOT_FOUND',
          message: '话题不存在'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误，请稍后重试'
      }
    }, { status: 500 });
  }
}

/**
 * 🔍 获取话题列表处理器
 */
export async function handleGetTopics(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const options = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      status: searchParams.get('status') as any,
      titleContains: searchParams.get('search') || undefined
    };

    // 获取查询服务
    const container = GlobalContainer.getInstance();
    const queryService = container.getQueryService();

    // 执行查询
    const result = await queryService.getTopicList(options);

    // 构造响应
    const responseData = {
      success: true,
      data: {
        topics: result.items.map((topic: any) => ({
          id: topic.id,
          title: topic.title,
          status: topic.status,
          createdAt: topic.createdAt.toISOString()
        })),
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          hasNext: result.hasNext,
          hasPrevious: result.hasPrevious
        }
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Get topics error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误，请稍后重试'
      }
    }, { status: 500 });
  }
}

/**
 * 🎯 系统健康检查处理器
 */
export async function handleHealthCheck(request: NextRequest): Promise<NextResponse> {
  try {
    const container = GlobalContainer.getInstance();
    
    // 检查各个服务的健康状态
    const aiService = container.get<import('../core/domain/services').IAIService>('aiService');
    const cacheService = container.get<import('../core/domain/services').ICacheService>('cacheService');
    
    const checks = await Promise.all([
      // AI服务健康检查
      aiService?.checkHealth().catch(error => ({
        isHealthy: false,
        error: error.message
      })) || { isHealthy: false, error: 'AI service not available' },
      
      // 缓存服务统计
      cacheService?.getStats().catch(() => ({
        hitRate: 0,
        missRate: 1,
        totalKeys: 0,
        memoryUsage: 0
      })) || { hitRate: 0, missRate: 1, totalKeys: 0, memoryUsage: 0 }
    ]);

    const [aiHealth, cacheStats] = checks;

    const responseData = {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          ai: aiHealth,
          cache: {
            isHealthy: true,
            stats: cacheStats
          },
          database: {
            isHealthy: true, // TODO: 添加数据库连接检查
            latency: 0
          }
        },
        version: process.env.npm_package_version || '1.0.0'
      }
    };

    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error('Health check error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: errorMessage
      }
    }, { status: 503 });
  }
}
