/**
 * 🎯 Health Check API - 使用重构后的架构
 * 
 * 基于DDD重构架构的健康检查API端点
 * 提供系统状态监控和诊断信息
 */

import { NextRequest } from 'next/server';

import { handleHealthCheck } from '@/adapters/api-handlers';
import { GlobalContainer } from '@/core/container';

// 确保容器在应用启动时初始化
if (!process.env.__CONTAINER_INITIALIZED__) {
  GlobalContainer.initialize();
  process.env.__CONTAINER_INITIALIZED__ = 'true';
}

/**
 * 系统健康检查
 * 
 * @param request - NextRequest对象
 * @returns 系统健康状态
 */
export async function GET(request: NextRequest) {
  return handleHealthCheck(request);
}
