/**
 * 🎯 Topic Detail API - 使用重构后的架构
 * 
 * 基于DDD重构架构的话题详情API端点
 * 提供类型安全、错误处理和性能优化
 */

import { NextRequest } from 'next/server';

import { handleGetTopic } from '@/adapters/api-handlers';
import { GlobalContainer } from '@/core/container';

// 确保容器在应用启动时初始化
if (!process.env.__CONTAINER_INITIALIZED__) {
  GlobalContainer.initialize();
  process.env.__CONTAINER_INITIALIZED__ = 'true';
}

/**
 * 获取单个话题详情
 * 
 * @param request - NextRequest对象
 * @param params - 路由参数
 * @returns 话题详情数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleGetTopic(request, { params });
}
