/**
 * 工具函数集合
 * 用于样式组合和条件渲染
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 组合和合并Tailwind CSS类名
 * 使用clsx进行条件组合，twMerge处理冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化时间显示
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return d.toLocaleDateString('zh-CN');
  } else if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' });
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (Math.abs(days) >= 1) {
    return rtf.format(days, 'day');
  } else if (Math.abs(hours) >= 1) {
    return rtf.format(hours, 'hour');
  } else if (Math.abs(minutes) >= 1) {
    return rtf.format(minutes, 'minute');
  } else {
    return rtf.format(seconds, 'second');
  }
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 数字格式化
 */
export function formatNumber(num: number, locale: string = 'zh-CN'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * 生成随机ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (typeof obj === 'object') {
    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

/**
 * 检查是否为空值
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}

/**
 * 滚动到元素
 */
export function scrollToElement(
  elementId: string, 
  behavior: ScrollBehavior = 'smooth'
): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior, block: 'start' });
  }
}

/**
 * 获取元素尺寸
 */
export function getElementSize(elementId: string): { width: number; height: number } | null {
  const element = document.getElementById(elementId);
  if (!element) return null;
  
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height
  };
}

/**
 * 颜色工具
 */
export const colors = {
  /**
   * 将十六进制颜色转换为RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  /**
   * 将RGB颜色转换为十六进制
   */
  rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  },
  
  /**
   * 获取颜色的对比色
   */
  getContrastColor(hexColor: string): 'black' | 'white' {
    const rgb = this.hexToRgb(hexColor);
    if (!rgb) return 'black';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
  }
};
