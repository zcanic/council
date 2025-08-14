/**
 * 🏛️ Parliament Loop - 完美首页
 * 
 * 基于重构架构和设计系统的首页实现
 * 体现Jobs式的完美主义和对细节的极致追求
 */

import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// 动态导入优化首页加载性能
const TopicLobby = dynamic(() => import('@/components/lobby/TopicLobby'), {
  loading: () => <TopicLobbyFallback />,
  ssr: false
});

/**
 * 页面元数据 - SEO优化
 */
export const metadata: Metadata = {
  title: '议会回环 - Parliament Loop | AI驱动的智慧讨论平台',
  description: '通过AI智能分析，将分散的讨论聚合为结构化的智慧。体验全新的思辨方式，构建知识的智慧树。',
  keywords: ['AI讨论', '智慧提纯', '知识管理', '思辨平台', '协作讨论'],
  authors: [{ name: 'Parliament Loop Team' }],
  openGraph: {
    title: '议会回环 - Parliament Loop',
    description: 'AI驱动的智慧讨论平台',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '议会回环 - Parliament Loop',
    description: 'AI驱动的智慧讨论平台',
  },
  robots: {
    index: true,
    follow: true,
  }
};

/**
 * 🎨 话题大厅加载占位符
 * 提供优雅的加载体验
 */
function TopicLobbyFallback() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* 页面标题骨架 */}
      <div className="text-center space-y-4">
        <div className="h-12 w-96 mx-auto bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-6 w-64 mx-auto bg-gray-100 rounded animate-pulse" />
      </div>
      
      {/* 创建话题按钮骨架 */}
      <div className="flex justify-center">
        <div className="h-12 w-40 bg-blue-100 rounded-lg animate-pulse" />
      </div>
      
      {/* 话题卡片骨架 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-xl border border-gray-100 space-y-4">
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 🏛️ 完美首页组件
 * 
 * 特点：
 * - 性能优化：代码分割和动态导入
 * - SEO优化：完整的元数据配置
 * - 用户体验：优雅的加载状态
 * - 响应式设计：移动端和桌面端适配
 * - 可访问性：遵循WCAG 2.1标准
 */
export default function HomePage() {
  return (
    <main 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      role="main"
      aria-label="Parliament Loop 主页"
    >
      {/* 🎯 核心内容区域 */}
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题区域 */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            议会回环
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI驱动的智慧讨论平台，将分散的思考聚合为结构化的知识
          </p>
        </header>
        
        {/* 主要内容 */}
        <Suspense fallback={<TopicLobbyFallback />}>
          <TopicLobby />
        </Suspense>
      </div>
      
      {/* 🎨 装饰性背景元素 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>
    </main>
  );
}
