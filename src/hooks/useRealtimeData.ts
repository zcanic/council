// SNS级别的实时状态管理Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { optimisticManager, OptimisticState } from '@/lib/optimistic-manager';

export interface RealtimeState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  optimisticData: T;
  isStale: boolean;
}

export interface RealtimeOptions {
  refreshInterval?: number; // 自动刷新间隔
  staleTime?: number; // 数据过期时间
  retryOnError?: boolean;
  optimisticUpdates?: boolean;
}

export function useRealtimeData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: RealtimeOptions = {}
): RealtimeState<T> & {
  mutate: (mutationFn: () => Promise<any>, optimisticData?: any) => Promise<any>;
  refresh: () => Promise<void>;
} {
  const {
    refreshInterval = 30000, // 30秒自动刷新
    staleTime = 60000, // 1分钟过期
    retryOnError = true,
    optimisticUpdates = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimisticState, setOptimisticState] = useState<OptimisticState>({
    actions: [],
    rollbacks: new Map()
  });
  const [isStale, setIsStale] = useState(false);
  
  const lastFetchTime = useRef<number>(0);
  const retryCount = useRef(0);
  const refreshTimer = useRef<NodeJS.Timeout>();

  // 订阅乐观更新状态
  useEffect(() => {
    if (!optimisticUpdates) return;
    
    const unsubscribe = optimisticManager.subscribe(setOptimisticState);
    return () => {
      unsubscribe();
    };
  }, [optimisticUpdates]);

  // 获取乐观数据
  const getOptimisticData = useCallback((originalData: T): T => {
    if (!optimisticUpdates || !data) return originalData;
    
    // 如果是数组数据，应用乐观更新
    if (Array.isArray(originalData)) {
      return optimisticManager.getOptimisticData('comment', originalData) as T;
    }
    
    return originalData;
  }, [optimisticUpdates, data]);

  // 核心数据获取函数
  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const result = await fetchFn();
      setData(result);
      lastFetchTime.current = Date.now();
      setIsStale(false);
      retryCount.current = 0;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载失败';
      setError(errorMessage);
      
      // 自动重试机制
      if (retryOnError && retryCount.current < 3) {
        retryCount.current++;
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
        setTimeout(() => fetchData(false), delay);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [fetchFn, retryOnError]);

  // 智能刷新：检查是否需要刷新
  const smartRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    
    // 数据过期，需要刷新
    if (timeSinceLastFetch > staleTime) {
      setIsStale(true);
      await fetchData(false);
    }
  }, [fetchData, staleTime]);

  // 手动刷新
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // SNS级别的乐观变更
  const mutate = useCallback(async (
    mutationFn: () => Promise<any>,
    optimisticData?: any
  ) => {
    if (!optimisticUpdates || !data) {
      return mutationFn();
    }

    // 立即应用乐观更新
    if (optimisticData) {
      const actionType = optimisticData._action || 'create';
      const resource = optimisticData._resource || 'comment';
      
      return optimisticManager.optimisticUpdate(
        actionType,
        resource,
        optimisticData,
        mutationFn
      );
    }

    return mutationFn();
  }, [optimisticUpdates, data]);

  // 初始化数据加载
  useEffect(() => {
    fetchData();
  }, dependencies);

  // 设置自动刷新
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshTimer.current = setInterval(smartRefresh, refreshInterval);
      
      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }
  }, [smartRefresh, refreshInterval]);

  // 页面可见性变化时刷新
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        smartRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [smartRefresh]);

  return {
    data: data as T,
    loading,
    error,
    optimisticData: data ? getOptimisticData(data) : data as T,
    isStale,
    mutate,
    refresh
  };
}

// 专门用于评论的实时Hook
export function useRealtimeComments(topicId: string) {
  return useRealtimeData(
    () => fetch(`/api/topics/${topicId}`).then(res => res.json()),
    [topicId],
    {
      refreshInterval: 15000, // 15秒刷新
      staleTime: 30000, // 30秒过期
      optimisticUpdates: true
    }
  );
}

// 专门用于议题列表的实时Hook
export function useRealtimeTopics() {
  return useRealtimeData(
    () => fetch('/api/topics').then(res => res.json()),
    [],
    {
      refreshInterval: 60000, // 60秒刷新
      staleTime: 120000, // 2分钟过期
      optimisticUpdates: true
    }
  );
}
