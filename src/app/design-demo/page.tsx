/**
 * 重构设计演示页面
 * 展示新的设计系统和组件
 */

'use client';

import { useState } from 'react';
import Card, { CardHeader, CardContent, CardTitle, CardDescription, StatusCard } from '@/components/ui/Card.new';
import Button, { ButtonGroup, IconButton } from '@/components/ui/Button.new';
import { 
  Sparkles, 
  MessageSquare, 
  Plus, 
  Heart, 
  Share, 
  Download,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';

export default function DesignDemo() {
  const [activeTab, setActiveTab] = useState('cards');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="content-container py-8 space-y-12">
        
        {/* 页面头部 */}
        <section className="text-center space-y-4">
          <h1 className="heading-primary">设计系统演示</h1>
          <p className="text-body-large max-w-2xl mx-auto">
            全新设计的Parliament Loop界面，更优雅、更直观、更具仪式感。
          </p>
        </section>

        {/* 导航标签 */}
        <section className="flex justify-center">
          <ButtonGroup size="lg" style="separated">
            <Button 
              variant={activeTab === 'cards' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('cards')}
            >
              卡片组件
            </Button>
            <Button 
              variant={activeTab === 'buttons' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('buttons')}
            >
              按钮组件
            </Button>
            <Button 
              variant={activeTab === 'status' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('status')}
            >
              状态指示
            </Button>
          </ButtonGroup>
        </section>

        {/* 卡片组件演示 */}
        {activeTab === 'cards' && (
          <section className="space-y-8">
            <h2 className="heading-secondary text-center">卡片组件系统</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 默认卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle>默认卡片</CardTitle>
                  <CardDescription>
                    基础的卡片样式，适用于大多数内容展示场景。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-body">
                    这是卡片的内容区域，可以包含任何类型的内容。
                  </p>
                </CardContent>
              </Card>

              {/* 交互式卡片 */}
              <Card 
                variant="interactive"
                onClick={() => alert('卡片被点击了！')}
              >
                <CardHeader>
                  <CardTitle>交互式卡片</CardTitle>
                  <CardDescription>
                    可点击的卡片，带有悬停效果和视觉反馈。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-body">
                    点击这张卡片试试看！悬停时会有微妙的动画效果。
                  </p>
                </CardContent>
              </Card>

              {/* 高级卡片 */}
              <Card variant="elevated" size="lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-primary-600" size={20} />
                    <CardTitle>高级卡片</CardTitle>
                  </div>
                  <CardDescription>
                    带有图标和更强阴影效果的卡片。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={16} className="text-neutral-500" />
                      <span className="text-body">10条评论</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full w-3/4 transition-all duration-500" />
                    </div>
                    <p className="text-caption">讨论进度 75%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* 按钮组件演示 */}
        {activeTab === 'buttons' && (
          <section className="space-y-8">
            <h2 className="heading-secondary text-center">按钮组件系统</h2>
            
            <div className="space-y-8">
              {/* 按钮变体 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">按钮变体</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary">主要按钮</Button>
                  <Button variant="secondary">次要按钮</Button>
                  <Button variant="outline">边框按钮</Button>
                  <Button variant="ghost">透明按钮</Button>
                  <Button variant="destructive">危险按钮</Button>
                  <Button variant="success">成功按钮</Button>
                  <Button variant="warning">警告按钮</Button>
                </div>
              </div>

              {/* 按钮尺寸 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">按钮尺寸</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="xs">超小</Button>
                  <Button size="sm">小号</Button>
                  <Button size="md">中号</Button>
                  <Button size="lg">大号</Button>
                  <Button size="xl">超大</Button>
                </div>
              </div>

              {/* 带图标的按钮 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">图标按钮</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button leftIcon={<Plus size={16} />}>添加内容</Button>
                  <Button rightIcon={<Share size={16} />}>分享</Button>
                  <Button 
                    leftIcon={<Download size={16} />} 
                    rightIcon={<Share size={16} />}
                  >
                    下载并分享
                  </Button>
                </div>
              </div>

              {/* 图标按钮 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">纯图标按钮</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <IconButton icon={<Heart size={16} />} aria-label="喜欢" />
                  <IconButton icon={<Share size={16} />} aria-label="分享" variant="outline" />
                  <IconButton icon={<Plus size={20} />} aria-label="添加" size="lg" />
                  <IconButton icon={<Download size={14} />} aria-label="下载" size="sm" variant="ghost" />
                </div>
                <p className="text-sm text-neutral-600">
                  修复：图标现在完美居中，在所有尺寸下都保持良好的视觉平衡
                </p>
              </div>

              {/* 按钮状态 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">按钮状态</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button>正常状态</Button>
                  <Button disabled>禁用状态</Button>
                  <Button loading>加载状态</Button>
                </div>
              </div>

              {/* 按钮组 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">按钮组</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-neutral-700">分离式按钮组 (推荐)</h4>
                    <ButtonGroup style="separated">
                      <Button>左侧</Button>
                      <Button>中间</Button>
                      <Button>右侧</Button>
                    </ButtonGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-neutral-700">连接式按钮组</h4>
                    <ButtonGroup style="attached">
                      <Button>左侧</Button>
                      <Button>中间</Button>
                      <Button>右侧</Button>
                    </ButtonGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-neutral-700">垂直按钮组</h4>
                    <ButtonGroup orientation="vertical" style="separated">
                      <Button>上方</Button>
                      <Button>中间</Button>
                      <Button>下方</Button>
                    </ButtonGroup>
                  </div>
                </div>
                <p className="text-sm text-neutral-600">
                  改进：分离式设计减少视觉拥挤，连接式设计优化了边框处理
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 状态指示演示 */}
        {activeTab === 'status' && (
          <section className="space-y-8">
            <h2 className="heading-secondary text-center">状态指示系统</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <StatusCard
                status="success"
                icon={<CheckCircle size={20} />}
                title="操作成功"
                description="您的议题已经成功创建，开始收集评论。"
              />
              
              <StatusCard
                status="warning"
                icon={<AlertTriangle size={20} />}
                title="注意提醒"
                description="此议题即将达到评论上限，AI总结即将开始。"
              />
              
              <StatusCard
                status="error"
                icon={<XCircle size={20} />}
                title="操作失败"
                description="网络连接异常，请检查网络后重试。"
              />
              
              <StatusCard
                status="info"
                icon={<Info size={20} />}
                title="系统信息"
                description="系统将在今晚进行维护，预计用时2小时。"
              />
            </div>
          </section>
        )}

        {/* 颜色系统展示 */}
        <section className="space-y-8">
          <h2 className="heading-secondary text-center">色彩系统</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* 主色调 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">主色调 - 权威蓝</h3>
              <div className="space-y-2">
                <div className="h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white font-medium">
                  Primary 500
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 bg-primary-300 rounded text-xs flex items-center justify-center text-primary-900">300</div>
                  <div className="h-8 bg-primary-400 rounded text-xs flex items-center justify-center text-white">400</div>
                  <div className="h-8 bg-primary-600 rounded text-xs flex items-center justify-center text-white">600</div>
                </div>
              </div>
            </div>

            {/* 辅助色 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">辅助色 - 智慧金</h3>
              <div className="space-y-2">
                <div className="h-12 bg-accent-500 rounded-lg flex items-center justify-center text-white font-medium">
                  Accent 500
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 bg-accent-300 rounded text-xs flex items-center justify-center text-accent-900">300</div>
                  <div className="h-8 bg-accent-400 rounded text-xs flex items-center justify-center text-white">400</div>
                  <div className="h-8 bg-accent-600 rounded text-xs flex items-center justify-center text-white">600</div>
                </div>
              </div>
            </div>

            {/* 中性色 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">中性色 - 优雅灰</h3>
              <div className="space-y-2">
                <div className="h-12 bg-neutral-500 rounded-lg flex items-center justify-center text-white font-medium">
                  Neutral 500
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 bg-neutral-200 rounded text-xs flex items-center justify-center text-neutral-900">200</div>
                  <div className="h-8 bg-neutral-400 rounded text-xs flex items-center justify-center text-white">400</div>
                  <div className="h-8 bg-neutral-700 rounded text-xs flex items-center justify-center text-white">700</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
