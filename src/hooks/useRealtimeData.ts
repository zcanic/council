'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * 🔄 实时数据Hook配置选项
 */
interface UseRealtimeDataOptions<T> {
  /** 数据获取函数 */
  fetchFn: () => Promise<T>;
  /** 自动刷新间隔(ms)，0为禁用 */
  refreshInterval?: number;
  /** 数据过期时间(ms) */
  staleTime?: number;
  /** 启用错误重试 */
  retryOnError?: boolean;
  /** 启用乐观更新 */
  optimisticUpdates?: boolean;
  /** 依赖数组 */
  dependencies?: React.DependencyList;
  /** 是否启用后台刷新 */
  backgroundRefresh?: boolean;
  /** 数据验证函数 */
  validate?: (data: T) => boolean;
}

/**
 * 🔄 实时数据Hook返回类型
 */
interface UseRealtimeDataResult<T> {
  /** 数据 */
  data: T | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 数据是否过期 */
  isStale: boolean;
  /** 手动刷新 */
  refresh: () => Promise<void>;
  /** 乐观更新 */
  mutate: <R>(
    mutationFn: () => Promise<R>,
    optimisticData?: Partial<T>
  ) => Promise<R>;
  /** 最后更新时间 */
  lastUpdated: Date | null;
}

/**
 * 🔄 智能实时数据管理Hook
 * 
 * 提供数据获取、缓存、自动刷新、乐观更新等功能
 * 支持错误重试、数据验证、后台刷新等高级特性
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refresh, mutate } = useRealtimeData({
 *   fetchFn: () => fetchTopicData(topicId),
 *   refreshInterval: 30000, // 30秒自动刷新
 *   retryOnError: true,
 *   dependencies: [topicId]
 * });
 * 
 * // 乐观更新示例
 * const handleLike = async () => {
 *   await mutate(
 *     () => api.likeTopic(topicId),
 *     { likes: (data?.likes || 0) + 1 } // 乐观更新
 *   );
 * };
 * ```
 */
export function useRealtimeData<T>({
  fetchFn,
  refreshInterval = 0,
  staleTime = 300000, // 5分钟
  retryOnError = true,
  optimisticUpdates = false,
  dependencies = [],
  backgroundRefresh = true,
  validate
}: UseRealtimeDataOptions<T>): UseRealtimeDataResult<T> {
  
  // 状态管理
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 引用管理
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);
  const lastFetchTime = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  // Memoized fetchFn to prevent unnecessary re-renders
  const memoizedFetchFn = useCallback(fetchFn, [fetchFn, ...dependencies]);

  /**
   * 核心数据获取函数
   */
  const fetchData = useCallback(async (showLoading = true): Promise<void> => {
    try {
      // 取消之前的请求
      if (abortController.current) {
        abortController.current.abort();
      }
      
      abortController.current = new AbortController();
      
      if (showLoading) setLoading(true);
      setError(null);
      
      const result = await memoizedFetchFn();
      
      // 数据验证
      if (validate && !validate(result)) {
        throw new Error('Data validation failed');
      }
      
      setData(result);
      setLastUpdated(new Date());
      lastFetchTime.current = Date.now();
      setIsStale(false);
      retryCount.current = 0;
      
    } catch (err) {
      // 忽略取消的请求
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

      setError(errorMessage);
      
      // 自动重试机制
      if (retryOnError && retryCount.current < 3) {
        retryCount.current++;
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
        
        setTimeout(() => {
          fetchData(false);
        }, delay);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [memoizedFetchFn, retryOnError, validate]);

  /**
   * 智能刷新：检查数据是否过期并刷新
   */
  const smartRefresh = useCallback(async (): Promise<void> => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    
    // 数据过期，需要刷新
    if (timeSinceLastFetch > staleTime) {
      setIsStale(true);
      await fetchData(false);
    }
  }, [fetchData, staleTime]);

  /**
   * 手动刷新
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  /**
   * 乐观更新函数
   */
  const mutate = useCallback(async <R>(
    mutationFn: () => Promise<R>,
    optimisticData?: Partial<T>
  ): Promise<R> => {
    if (!optimisticUpdates || !data) {
      return mutationFn();
    }

    // 保存原始数据用于回滚
    const originalData = data;
    
    try {
      // 立即应用乐观更新
      if (optimisticData) {
        setData(prevData => ({
          ...prevData!,
          ...optimisticData
        }));
      }
      
      // 执行变更
      const result = await mutationFn();
      
      // 刷新真实数据
      await fetchData(false);
      
      return result;
    } catch (err) {
      // 回滚乐观更新
      setData(originalData);
      setError(err instanceof Error ? err.message : 'Mutation failed');
      throw err;
    }
  }, [data, optimisticUpdates, fetchData]);

  // 初始化数据加载
  useEffect(() => {
    fetchData();
    
    // 清理函数
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchData]);

  // 设置自动刷新
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshTimer.current = setInterval(() => {
        if (backgroundRefresh) {
          smartRefresh();
        } else {
          fetchData(false);
        }
      }, refreshInterval);
      
      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }

    return () => {}; // 空的清理函数
  }, [refreshInterval, backgroundRefresh, smartRefresh, fetchData]);

  // 页面可见性变化时刷新
  useEffect(() => {
    if (!backgroundRefresh) return;
    
    const handleVisibilityChange = () => {
      if (!document.hidden && data) {
        smartRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [backgroundRefresh, data, smartRefresh]);

  // 窗口焦点变化时刷新
  useEffect(() => {
    if (!backgroundRefresh) return;
    
    const handleFocus = () => {
      if (data) {
        smartRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [backgroundRefresh, data, smartRefresh]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []); // Empty dependency array for cleanup only

  return useMemo(() => ({
    data,
    loading,
    error,
    isStale,
    refresh,
    mutate,
    lastUpdated
  }), [data, loading, error, isStale, refresh, mutate, lastUpdated]);
}
