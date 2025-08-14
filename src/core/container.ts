/**
 * 🎯 Parliament Loop 依赖注入容器
 * 管理所有服务的创建和生命周期
 */

import { PrismaClient } from '@prisma/client';

import { WisdomLoopApplicationService, QueryApplicationService } from './application/services';
import type { 
  IUnitOfWork,
  ITopicRepository,
  ICommentRepository,
  ISummaryRepository
} from './domain/repositories';
import type {
  IAIService,
  IDiscussionLockService,
  INotificationService,
  ICacheService,
  IWisdomLoopService
} from './domain/services';
import { 
  PrismaUnitOfWork,
  PrismaTopicRepository,
  PrismaCommentRepository,
  PrismaSummaryRepository
} from './infrastructure/prisma-repositories';
import {
  MoonshotAIService,
  InMemoryLockService,
  ConsoleNotificationService,
  InMemoryCacheService
} from './infrastructure/services';



/**
 * 🏭 服务容器配置
 */
export interface ContainerConfig {
  // 数据库配置
  database: {
    url: string;
  };
  
  // AI 服务配置
  ai: {
    provider: 'moonshot' | 'openai';
    apiKey: string;
    modelName?: string;
    baseURL?: string;
    maxTokens?: number;
    temperature?: number;
  };
  
  // 缓存配置
  cache: {
    provider: 'memory' | 'redis';
    ttl?: number;
    redisUrl?: string;
  };
  
  // 通知配置
  notification: {
    provider: 'console' | 'email' | 'webhook';
    emailConfig?: any;
    webhookUrl?: string;
  };
  
  // 应用配置
  app: {
    commentsPerLoop?: number;
    lockTimeout?: number;
    enableAnalytics?: boolean;
  };
}

/**
 * 🎯 核心服务容器
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();
  private config: ContainerConfig;

  constructor(config: ContainerConfig) {
    this.config = config;
    this.initializeServices();
  }

  public static getInstance(config?: ContainerConfig): ServiceContainer {
    if (!ServiceContainer.instance && config) {
      ServiceContainer.instance = new ServiceContainer(config);
    }

    return ServiceContainer.instance;
  }

  /**
   * 🔧 初始化所有服务
   */
  private initializeServices(): void {
    // 1. 基础设施服务
    this.registerInfrastructureServices();
    
    // 2. 领域服务
    this.registerDomainServices();
    
    // 3. 应用服务
    this.registerApplicationServices();
  }

  /**
   * 🔧 注册基础设施服务
   */
  private registerInfrastructureServices(): void {
    // 数据库客户端
    const prisma = new PrismaClient({
      datasources: {
        db: { url: this.config.database.url }
      }
    });

    this.services.set('prismaClient', prisma);

    // 仓储
    this.services.set('unitOfWork', new PrismaUnitOfWork(prisma));
    this.services.set('topicRepository', new PrismaTopicRepository(prisma));
    this.services.set('commentRepository', new PrismaCommentRepository(prisma));
    this.services.set('summaryRepository', new PrismaSummaryRepository(prisma));

    // AI 服务
    if (this.config.ai.provider === 'moonshot') {
      this.services.set('aiService', new MoonshotAIService({
        apiKey: this.config.ai.apiKey,
        modelName: this.config.ai.modelName,
        baseURL: this.config.ai.baseURL,
        maxTokens: this.config.ai.maxTokens,
        temperature: this.config.ai.temperature
      }));
    }

    // 锁定服务
    this.services.set('lockService', new InMemoryLockService());

    // 缓存服务
    if (this.config.cache.provider === 'memory') {
      this.services.set('cacheService', new InMemoryCacheService());
    }

    // 通知服务
    if (this.config.notification.provider === 'console') {
      this.services.set('notificationService', new ConsoleNotificationService());
    }
  }

  /**
   * 🔧 注册领域服务
   */
  private registerDomainServices(): void {
    // TODO: 实现 WisdomLoopService
    // this.services.set('wisdomLoopService', new WisdomLoopService(...));
    
    // TODO: 实现 SchedulerService
    // this.services.set('schedulerService', new SchedulerService(...));
    
    // TODO: 实现 ContentAnalysisService
    // this.services.set('contentAnalysisService', new ContentAnalysisService(...));
    
    // TODO: 实现 SecurityService
    // this.services.set('securityService', new SecurityService(...));
  }

  /**
   * 🔧 注册应用服务
   */
  private registerApplicationServices(): void {
    const wisdomLoopService = this.get<WisdomLoopApplicationService>('wisdomLoopApplicationService');
    
    if (!wisdomLoopService) {
      this.services.set('wisdomLoopApplicationService', new WisdomLoopApplicationService(
        this.get<IUnitOfWork>('unitOfWork')!,
        this.get<IAIService>('aiService')!,
        this.get<IDiscussionLockService>('lockService')!,
        {} as IWisdomLoopService, // TODO: 实现
        this.get<INotificationService>('notificationService')!,
        this.get<ICacheService>('cacheService')!,
        {} as any, // schedulerService
        {} as any, // contentAnalysisService
        {} as any  // securityService
      ));
    }

    const queryService = this.get<QueryApplicationService>('queryApplicationService');

    if (!queryService) {
      this.services.set('queryApplicationService', new QueryApplicationService(
        this.get<IUnitOfWork>('unitOfWork')!,
        this.get<ICacheService>('cacheService')!
      ));
    }
  }

  /**
   * 🔍 获取服务实例
   */
  public get<T>(serviceName: string): T | undefined {
    return this.services.get(serviceName) as T;
  }

  /**
   * 📝 注册服务
   */
  public register<T>(serviceName: string, service: T): void {
    this.services.set(serviceName, service);
  }

  /**
   * 🎯 获取智慧回环应用服务
   */
  public getWisdomLoopService(): WisdomLoopApplicationService {
    const service = this.get<WisdomLoopApplicationService>('wisdomLoopApplicationService');

    if (!service) {
      throw new Error('WisdomLoopApplicationService not found');
    }

    return service;
  }

  /**
   * 🔍 获取查询服务
   */
  public getQueryService(): QueryApplicationService {
    const service = this.get<QueryApplicationService>('queryApplicationService');

    if (!service) {
      throw new Error('QueryApplicationService not found');
    }

    return service;
  }

  /**
   * 🧹 清理资源
   */
  public async dispose(): Promise<void> {
    const prisma = this.get<PrismaClient>('prismaClient');

    if (prisma) {
      await prisma.$disconnect();
    }
    
    this.services.clear();
  }
}

/**
 * 🏭 服务工厂
 * 简化服务创建和配置
 */
export class ServiceFactory {
  /**
   * 🎯 创建开发环境容器
   */
  public static createDevelopmentContainer(): ServiceContainer {
    const config: ContainerConfig = {
      database: {
        url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/parliament_loop'
      },
      ai: {
        provider: 'moonshot',
        apiKey: process.env.MOONSHOT_API_KEY || 'your-api-key',
        modelName: 'moonshot-v1-8k',
        baseURL: 'https://api.moonshot.cn/v1'
      },
      cache: {
        provider: 'memory',
        ttl: 3600
      },
      notification: {
        provider: 'console'
      },
      app: {
        commentsPerLoop: 10,
        lockTimeout: 600,
        enableAnalytics: true
      }
    };

    return new ServiceContainer(config);
  }

  /**
   * 🎯 创建生产环境容器
   */
  public static createProductionContainer(): ServiceContainer {
    const config: ContainerConfig = {
      database: {
        url: process.env.DATABASE_URL!
      },
      ai: {
        provider: 'moonshot',
        apiKey: process.env.MOONSHOT_API_KEY!,
        modelName: process.env.AI_MODEL_NAME || 'moonshot-v1-8k',
        baseURL: process.env.AI_BASE_URL || 'https://api.moonshot.cn/v1'
      },
      cache: {
        provider: 'memory', // 生产环境建议使用 'redis'
        ttl: 3600
      },
      notification: {
        provider: 'console' // 生产环境建议配置真实的通知服务
      },
      app: {
        commentsPerLoop: 10,
        lockTimeout: 600,
        enableAnalytics: true
      }
    };

    return new ServiceContainer(config);
  }

  /**
   * 🧪 创建测试环境容器
   */
  public static createTestContainer(): ServiceContainer {
    const config: ContainerConfig = {
      database: {
        url: 'sqlite://test.db'
      },
      ai: {
        provider: 'moonshot',
        apiKey: 'test-api-key',
        modelName: 'test-model'
      },
      cache: {
        provider: 'memory',
        ttl: 60
      },
      notification: {
        provider: 'console'
      },
      app: {
        commentsPerLoop: 3, // 测试用更小的阈值
        lockTimeout: 30,
        enableAnalytics: false
      }
    };

    return new ServiceContainer(config);
  }
}

/**
 * 🎯 全局容器管理器
 */
export class GlobalContainer {
  private static container: ServiceContainer | null = null;

  /**
   * 初始化全局容器
   */
  public static initialize(config?: ContainerConfig): ServiceContainer {
    if (!GlobalContainer.container) {
      if (config) {
        GlobalContainer.container = new ServiceContainer(config);
      } else if (process.env.NODE_ENV === 'production') {
        GlobalContainer.container = ServiceFactory.createProductionContainer();
      } else if (process.env.NODE_ENV === 'test') {
        GlobalContainer.container = ServiceFactory.createTestContainer();
      } else {
        GlobalContainer.container = ServiceFactory.createDevelopmentContainer();
      }
    }

    return GlobalContainer.container;
  }

  /**
   * 获取全局容器实例
   */
  public static getInstance(): ServiceContainer {
    if (!GlobalContainer.container) {
      throw new Error('Container not initialized. Call GlobalContainer.initialize() first.');
    }

    return GlobalContainer.container;
  }

  /**
   * 清理全局容器
   */
  public static async dispose(): Promise<void> {
    if (GlobalContainer.container) {
      await GlobalContainer.container.dispose();
      GlobalContainer.container = null;
    }
  }
}
