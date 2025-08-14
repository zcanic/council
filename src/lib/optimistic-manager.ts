// 高级乐观更新管理器
// SNS级别的用户体验管理

export interface OptimisticAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: 'topic' | 'comment' | 'summary';
  data: any;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

export interface OptimisticState {
  actions: OptimisticAction[];
  rollbacks: Map<string, any>;
}

export class SNSOptimisticManager {
  private actions: Map<string, OptimisticAction> = new Map();
  private rollbacks: Map<string, any> = new Map();
  private listeners: Set<(state: OptimisticState) => void> = new Set();
  private retryQueue: OptimisticAction[] = [];

  // 立即执行乐观更新
  public optimisticUpdate<T>(
    actionType: OptimisticAction['type'],
    resource: OptimisticAction['resource'],
    data: T,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const actionId = this.generateId();
    const action: OptimisticAction = {
      id: actionId,
      type: actionType,
      resource,
      data,
      timestamp: Date.now(),
      status: 'pending'
    };

    // 1. 立即更新UI (0ms延迟)
    this.actions.set(actionId, action);
    this.notifyListeners();

    // 2. 执行API调用
    return apiCall()
      .then((result) => {
        // 成功：确认更新
        action.status = 'success';
        action.data = result; // 使用服务器返回的数据
        this.notifyListeners();
        
        // 5秒后清理成功的操作
        setTimeout(() => this.cleanupAction(actionId), 5000);

        return result;
      })
      .catch((error) => {
        // 失败：智能回滚
        action.status = 'failed';
        this.handleFailure(actionId, error);
        throw error;
      });
  }

  // 智能错误处理和重试机制
  private handleFailure(actionId: string, error: any) {
    const action = this.actions.get(actionId);

    if (!action) return;

    // 网络错误 -> 自动重试
    if (this.isNetworkError(error)) {
      this.scheduleRetry(action);
    } else {
      // 业务错误 -> 立即回滚
      this.rollbackAction(actionId);
    }
  }

  // 渐进式重试机制
  private scheduleRetry(action: OptimisticAction, attempt = 1) {
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // 指数退避
    
    setTimeout(() => {
      if (attempt <= 3) {
        console.log(`🔄 Retry ${attempt}/3 for action ${action.id}`);
        this.retryAction(action).catch(() => {
          this.scheduleRetry(action, attempt + 1);
        });
      } else {
        // 最终失败，回滚
        this.rollbackAction(action.id);
      }
    }, delay);
  }

  // 订阅状态变化 (类似Redux)
  public subscribe(listener: (state: OptimisticState) => void) {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  // 获取当前乐观状态
  public getOptimisticData(resource: string, originalData: any[]): any[] {
    const pendingActions = Array.from(this.actions.values())
      .filter(a => a.resource === resource && a.status === 'pending');

    let result = [...originalData];

    pendingActions.forEach(action => {
      switch (action.type) {
        case 'create':
          // 添加到列表顶部，标记为pending
          result.unshift({
            ...action.data,
            _optimistic: true,
            _pending: true
          });
          break;
        case 'update':
          const index = result.findIndex(item => item.id === action.data.id);

          if (index !== -1) {
            result[index] = { ...result[index], ...action.data, _optimistic: true };
          }
          break;
        case 'delete':
          result = result.filter(item => item.id !== action.data.id);
          break;
      }
    });

    return result;
  }

  private generateId(): string {
    return `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isNetworkError(error: any): boolean {
    return error.message?.includes('fetch') || 
           error.message?.includes('timeout') ||
           error.message?.includes('network');
  }

  private async retryAction(action: OptimisticAction): Promise<any> {
    // 实现重试逻辑
    // 这里需要根据具体的API调用来实现
    throw new Error('Retry implementation needed');
  }

  private rollbackAction(actionId: string) {
    const action = this.actions.get(actionId);

    if (action) {
      action.status = 'failed';
      this.notifyListeners();
      
      // 3秒后移除失败的操作
      setTimeout(() => {
        this.actions.delete(actionId);
        this.notifyListeners();
      }, 3000);
    }
  }

  private cleanupAction(actionId: string) {
    this.actions.delete(actionId);
    this.rollbacks.delete(actionId);
    this.notifyListeners();
  }

  private notifyListeners() {
    const state: OptimisticState = {
      actions: Array.from(this.actions.values()),
      rollbacks: this.rollbacks
    };
    
    this.listeners.forEach(listener => listener(state));
  }
}

// 全局单例
export const optimisticManager = new SNSOptimisticManager();
