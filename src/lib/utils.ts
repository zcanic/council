/**
 * 🛠️ Parliament Loop - 完美工具函数库
 * 
 * Jobs式的完美主义：每一个工具函数都经过精心设计和优化
 * 提供类型安全、性能优化和开发体验的完美平衡
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 🎨 样式合并工具
 * 
 * 智能合并Tailwind CSS类名，处理冲突和优先级
 * 基于clsx和tailwind-merge的完美结合
 * 
 * @example
 * ```ts
 * cn('px-2 py-1', isActive && 'bg-blue-500', 'px-4') // 'py-1 bg-blue-500 px-4'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 📏 数值格式化工具
 */
export const formatters = {
  /**
   * 格式化数字为人类可读格式
   * @example formatNumber(1234) => "1.2k"
   */
  number: (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;

    return `${(num / 1000000).toFixed(1)}M`;
  },

  /**
   * 格式化文件大小
   * @example formatBytes(1024) => "1.0 KB"
   */
  bytes: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },

  /**
   * 格式化相对时间
   * @example formatRelativeTime(new Date(Date.now() - 3600000)) => "1小时前"
   */
  relativeTime: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  },

  /**
   * 格式化持续时间
   * @example formatDuration(3665) => "1小时1分5秒"
   */
  duration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours}小时`);
    if (minutes > 0) parts.push(`${minutes}分钟`);
    if (secs > 0) parts.push(`${secs}秒`);

    return parts.join('') || '0秒';
  }
};

/**
 * 📝 文本处理工具
 */
export const textUtils = {
  /**
   * 截取文本到指定长度
   * @example truncate("Hello World", 5) => "Hello..."
   */
  truncate: (text: string, maxLength: number, suffix = '...'): string => {
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength - suffix.length) + suffix;
  },

  /**
   * 提取文本摘要
   */
  excerpt: (text: string, maxLength = 150): string => {
    const cleaned = text.replace(/\s+/g, ' ').trim();

    if (cleaned.length <= maxLength) return cleaned;
    
    // 尝试在句号处截断
    const sentences = cleaned.split(/[。！？]/);
    let excerpt = '';
    
    for (const sentence of sentences) {
      if ((excerpt + sentence).length <= maxLength) {
        excerpt += sentence + (cleaned.includes(`${sentence}。`) ? '。' : '');
      } else {
        break;
      }
    }
    
    return excerpt || textUtils.truncate(cleaned, maxLength);
  },

  /**
   * 高亮搜索关键词
   */
  highlight: (text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  },

  /**
   * 生成唯一的slug
   */
  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }
};

/**
 * 🛡️ 数据验证工具
 */
export const validators = {
  /**
   * 验证邮箱格式
   */
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
  },

  /**
   * 验证URL格式
   */
  url: (url: string): boolean => {
    try {
      new URL(url);

      return true;
    } catch {
      return false;
    }
  },

  /**
   * 验证中文姓名
   */
  chineseName: (name: string): boolean => {
    const regex = /^[\u4e00-\u9fa5]{2,10}$/;

    return regex.test(name);
  },

  /**
   * 验证手机号码
   */
  phone: (phone: string): boolean => {
    const regex = /^1[3-9]\d{9}$/;

    return regex.test(phone);
  }
};

/**
 * 🎯 数组工具
 */
export const arrayUtils = {
  /**
   * 数组去重
   */
  unique: <T>(array: T[], keyFn?: (item: T) => any): T[] => {
    if (!keyFn) {
      const set = new Set(array);

      return Array.from(set);
    }
    
    const seen = new Set();

    return array.filter(item => {
      const key = keyFn(item);

      if (seen.has(key)) return false;
      seen.add(key);

      return true;
    });
  },

  /**
   * 数组分组
   */
  groupBy: <T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const key = keyFn(item);

      groups[key] = groups[key] || [];
      groups[key].push(item);

      return groups;
    }, {} as Record<string, T[]>);
  },

  /**
   * 数组排序（支持多字段）
   */
  sortBy: <T>(array: T[], ...keys: Array<keyof T | ((item: T) => any)>): T[] => {
    return [...array].sort((a, b) => {
      for (const key of keys) {
        const getValue = typeof key === 'function' ? key : (item: T) => item[key];
        const aVal = getValue(a);
        const bVal = getValue(b);
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      }

      return 0;
    });
  },

  /**
   * 数组分页
   */
  paginate: <T>(array: T[], page: number, size: number): T[] => {
    const startIndex = (page - 1) * size;

    return array.slice(startIndex, startIndex + size);
  }
};

/**
 * 🔐 安全工具
 */
export const securityUtils = {
  /**
   * HTML实体编码
   */
  escapeHtml: (text: string): string => {
    const div = document.createElement('div');

    div.textContent = text;

    return div.innerHTML;
  },

  /**
   * 生成随机字符串
   */
  randomString: (length = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  },

  /**
   * 简单的哈希函数（用于客户端，非加密用途）
   */
  simpleHash: (str: string): number => {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);

      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }

    return hash;
  }
};

/**
 * 🚀 性能工具
 */
export const performanceUtils = {
  /**
   * 防抖函数
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * 节流函数
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 测量函数执行时间
   */
  measureTime: async <T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);

    return result;
  }
};

/**
 * 🌐 浏览器工具
 */
export const browserUtils = {
  /**
   * 复制文本到剪贴板
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);

      return true;
    } catch {
      // 降级方案
      const textarea = document.createElement('textarea');

      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');

      document.body.removeChild(textarea);

      return success;
    }
  },

  /**
   * 获取设备类型
   */
  getDeviceType: (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;

    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';

    return 'desktop';
  },

  /**
   * 检测浏览器支持
   */
  supports: {
    webp: (): boolean => {
      const canvas = document.createElement('canvas');

      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    },
    
    localStorage: (): boolean => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');

        return true;
      } catch {
        return false;
      }
    }
  }
};

/**
 * 🎲 颜色工具
 */
export const colorUtils = {
  /**
   * 生成随机颜色
   */
  randomColor: (): string => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  },

  /**
   * 根据字符串生成一致的颜色
   */
  stringToColor: (str: string): string => {
    const hash = securityUtils.simpleHash(str);
    const hue = Math.abs(hash) % 360;

    return `hsl(${hue}, 70%, 60%)`;
  },

  /**
   * 获取颜色的对比色
   */
  getContrastColor: (hexColor: string): string => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? '#000000' : '#FFFFFF';
  }
};

/**
 * 📱 移动端工具
 */
export const mobileUtils = {
  /**
   * 检测是否为移动设备
   */
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * 防止iOS Safari的橡皮筋效果
   */
  preventBounce: (): void => {
    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  },

  /**
   * 触发触觉反馈（如果支持）
   */
  hapticFeedback: (style: 'light' | 'medium' | 'heavy' = 'light'): void => {
    if ('vibrate' in navigator) {
      const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 50;

      navigator.vibrate(duration);
    }
  }
};
