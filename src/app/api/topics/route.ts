/**
 * 🎯 Topics API - 使用重构后的架构
 * 
 * 基于DDD重构架构的话题API端点
 * 提供类型安全、错误处理和性能优化
 */

import { NextRequest } from 'next/server';

import { handleCreateTopic, handleGetTopics } from '@/adapters/api-handlers';
import { GlobalContainer } from '@/core/container';

// 确保容器在应用启动时初始化
if (!process.env.__CONTAINER_INITIALIZED__) {
  GlobalContainer.initialize();
  process.env.__CONTAINER_INITIALIZED__ = 'true';
}

/**
 * 获取所有话题
 * 
 * @param request - NextRequest对象
 * @returns 话题列表
 */
export async function GET(request: NextRequest) {
  return handleGetTopics(request);
}

/**
 * 创建新话题
 * 
 * @param request - NextRequest对象
 * @returns 新创建的话题数据
 */
export async function POST(request: NextRequest) {
  return handleCreateTopic(request);
}
