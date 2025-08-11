# Parliament Loop - 前端开发交接文档

> **为前端开发者提供的完整项目理解和开发指南**

## 🎯 项目概述

Parliament Loop（议会回环）是一个AI驱动的智慧讨论平台。核心机制是**每10条评论自动触发AI总结**，将分散的观点提纯为结构化的智慧，形成可无限递归的"智慧之树"。

### 核心业务流程
```
话题创建 → 用户评论 → 第10条评论触发AI → 生成摘要 → 锁定话题 → 摘要成为新讨论起点 → 循环往复
```

## 🏗️ 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端 (待开发)   │ ←→ │   Next.js API     │ ←→ │   MySQL数据库    │
│   React/Next.js │    │   后端服务         │    │   + Prisma ORM  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              ↓
                       ┌──────────────────┐
                       │   AI服务          │
                       │   OpenAI兼容API   │
                       └──────────────────┘
```

## 📊 数据模型理解

### 核心实体关系
```
Topic (话题)
├── status: "active" | "locked"  // 活跃状态或已锁定
├── comments: Comment[]          // 关联的评论
└── summaries: Summary[]         // AI生成的摘要

Comment (评论)
├── content: string              // 评论内容
├── author?: string              // 作者（可选）
├── topicId?: string            // 属于话题（二选一）
└── summaryId?: string          // 属于摘要（二选一）

Summary (AI摘要)
├── content: string              // 用户可读的摘要文本
├── metadata: JSON               // AI返回的完整结构化数据
├── topicId: string             // 根话题ID
├── parentId?: string           // 父摘要ID（支持无限嵌套）
├── children: Summary[]         // 子摘要数组
└── comments: Comment[]         // 基于此摘要的新评论
```

### 智慧之树结构示例
```
Topic: "AI对工作的影响"
├── Comments 1-10 → Summary A: "需要技能转型"
│   ├── Comments 1-10 → Summary A1: "在线教育是关键"
│   └── Comments 1-10 → Summary A2: "政府政策支持"
└── Comments 1-10 → Summary B: "创造新就业机会"
    └── Comments 1-10 → Summary B1: "新兴行业分析"
```

## 🔌 API接口详解

**服务器地址**: `http://localhost:3001` (开发环境)

### 1. 话题管理接口

#### GET /api/topics
获取所有话题列表

**响应示例**:
```json
[
  {
    "id": "cme7cf99y0000a7n498uu4q7l",
    "title": "人工智能对未来工作的影响",
    "status": "active",
    "createdAt": "2025-08-11T16:44:53.303Z"
  }
]
```

#### POST /api/topics
创建新话题

**请求体**:
```json
{
  "title": "讨论主题标题（5-255个字符）"
}
```

**响应示例**:
```json
{
  "id": "新生成的ID",
  "title": "讨论主题标题",
  "status": "active",
  "createdAt": "2025-08-12T10:00:00.000Z"
}
```

#### GET /api/topics/[id]
获取完整的智慧树结构

**响应示例**:
```json
{
  "id": "cme7cf99y0000a7n498uu4q7l",
  "title": "人工智能对未来工作的影响",
  "status": "locked",
  "createdAt": "2025-08-11T16:44:53.303Z",
  "comments": [
    {
      "id": "comment_id_1",
      "content": "AI会替代很多重复性工作...",
      "author": "张三",
      "createdAt": "2025-08-11T16:45:00.000Z",
      "topicId": "cme7cf99y0000a7n498uu4q7l",
      "summaryId": null
    }
  ],
  "summaries": [
    {
      "id": "summary_id_1",
      "content": "大部分人认为AI确实会影响就业，但观点存在分歧...",
      "metadata": {
        "consensus": "AI会影响就业市场",
        "disagreements": [
          {
            "point": "影响程度",
            "views": ["完全替代", "部分影响"]
          }
        ],
        "new_questions": ["如何进行技能转型？"]
      },
      "createdAt": "2025-08-11T16:50:00.000Z",
      "topicId": "cme7cf99y0000a7n498uu4q7l",
      "parentId": null,
      "comments": [],
      "children": []
    }
  ]
}
```

### 2. 评论系统接口

#### POST /api/comments
提交评论（可能触发AI摘要）

**请求体**:
```json
{
  "content": "评论内容（1-10000个字符）",
  "author": "作者名称（可选，最多100字符）",
  "parentId": "话题ID或摘要ID",
  "parentType": "topic" | "summary"
}
```

**成功响应（普通评论）**:
```json
{
  "id": "新评论ID",
  "content": "评论内容",
  "author": "作者名称",
  "createdAt": "2025-08-12T10:00:00.000Z",
  "topicId": "话题ID（如果是话题评论）",
  "summaryId": "摘要ID（如果是摘要评论）"
}
```

**特殊情况响应**:
- **第10条评论**: 正常创建评论，但会自动生成AI摘要并锁定父节点
- **话题已锁定**: `403 Forbidden` - `{"message": "This discussion loop is locked."}`
- **AI服务异常**: `503 Service Unavailable` - `{"message": "AI service is currently unavailable."}`

### 3. 系统接口

#### GET /api/health
系统健康检查

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-12T10:00:00.000Z",
  "database": "connected",
  "message": "Parliament Loop backend is running successfully"
}
```

## 🎨 前端需求分析

### 页面结构设计

#### 1. 主页 / 话题大厅 (`/`)
**功能需求**:
- 展示所有话题的可视化"思想节点"
- 非线性布局，避免传统列表形式
- 节点大小/颜色反映讨论热度和深度
- 悬停显示话题摘要信息
- 创建新话题的入口

**UI组件建议**:
```tsx
<TopicLobby>
  <TopicNode 
    id={topic.id}
    title={topic.title}
    status={topic.status}
    discussionDepth={topic.summaries.length}
    participantCount={topic.comments.length}
  />
  <CreateTopicButton />
</TopicLobby>
```

#### 2. 话题详情页 (`/topics/[id]`) - 渐进式设计
**核心理念**：卡片回环 + 树状探索的混合模式

**主视图 - 议会回环模式**:
- 🎯 **聚焦当前回合** - 大卡片展示正在进行的讨论
- 🔄 **回环进度指示** - 显示当前回合进度（如 "第3回合 - 7/10条评论"）
- 📝 **沉浸式评论** - 模拟议会发言的仪式感
- 🤖 **AI提纯动画** - 第10条评论触发的视觉转换

**辅助视图 - 智慧树模式**:
- 🌳 **讨论历程总览** - 点击切换到完整树状视图
- 🔍 **路径追溯** - 查看观点如何层层演化
- 🎯 **节点跳转** - 直接跳转到任意历史回合

**关键状态管理**:
```tsx
interface TopicPageState {
  viewMode: 'parliament' | 'tree';    // 视图模式切换
  currentRound: number;               // 当前回合数（从1开始）
  currentNodeId: string;              // 当前查看的节点ID
  currentNodeType: 'topic' | 'summary'; // 节点类型
  comments: Comment[];                // 当前节点的评论
  roundProgress: number;              // 当前回合进度 (1-10)
  canComment: boolean;                // 是否可以参与讨论
  treeData: TreeNode[];               // 完整的树状结构数据
}
```

#### 3. 视觉设计核心组件

**议会回环组件**:
```tsx
<ParliamentRoundCard>
  <RoundHeader>
    <RoundNumber>第 {currentRound} 回合</RoundNumber>
    <ProgressRing progress={roundProgress} total={10} />
    <ViewToggle onClick={() => setViewMode('tree')} />
  </RoundHeader>
  
  <DiscussionContent>
    <NodeSummary>{currentNodeSummary}</NodeSummary>
    <CommentCards comments={comments} />
  </DiscussionContent>
  
  <ParticipateSection>
    <CommentInput disabled={!canComment} />
    <SubmitButton>参与讨论</SubmitButton>
  </ParticipateSection>
</ParliamentRoundCard>
```

**智慧树可视化组件**:
```tsx
<WisdomTreeView>
  <TreeVisualization>
    <TreeNode 
      isActive={node.id === currentNodeId}
      isLocked={node.status === 'locked'}
      roundNumber={node.roundNumber}
      participantCount={node.comments.length}
      onClick={() => navigateToNode(node.id)}
    />
  </TreeVisualization>
  
  <TreeNavigation>
    <BackToParliament onClick={() => setViewMode('parliament')} />
    <PathBreadcrumb path={currentPath} />
  </TreeNavigation>
</WisdomTreeView>
```

### 关键交互逻辑

#### 评论提交流程
```typescript
const submitComment = async (content: string, author?: string) => {
  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        author,
        parentId: currentNodeId,
        parentType: currentNode
      })
    });

    if (response.status === 201) {
      // 普通评论成功
      refreshComments();
    } else if (response.status === 403) {
      // 话题已锁定
      showMessage('讨论已锁定，AI正在生成摘要...');
      refreshTopicData(); // 刷新整个话题数据
    } else if (response.status === 503) {
      // AI服务异常
      showMessage('AI服务暂不可用，请稍后再试');
    }
  } catch (error) {
    handleError(error);
  }
};
```

## 🎯 核心用户体验设计

### 议会回环的仪式感设计
1. **回合进度环** - 圆形进度条显示当前讨论进度（x/10）
2. **发言席动画** - 评论提交时的仪式感反馈
3. **AI议长介入** - 第10条评论后的"议长宣布"动画
4. **新回合启动** - 基于AI摘要开启下一回合的转场效果

### 智慧树的探索体验
1. **分支生长动画** - 新摘要生成时的树枝延伸效果  
2. **节点状态指示** - 不同颜色表示活跃/锁定/完成状态
3. **路径高亮** - 鼠标悬停时高亮完整讨论路径
4. **缩放导航** - 支持树状图的平移和缩放操作

### 双模式切换策略
**默认模式**：议会回环（降低学习成本）
- 新用户直接理解"当前正在讨论什么"
- 专注于参与当前回合，避免信息过载
- 渐进式引导用户理解系统机制

**高级模式**：智慧树视图（满足探索需求）
- 一键切换到全局视野
- 适合想要了解完整讨论历程的用户
- 支持从任意节点重新开始参与

## 🔧 技术栈建议

### 推荐技术选型
```json
{
  "框架": "Next.js 14 (已配置)",
  "UI库": "Tailwind CSS (已配置) + shadcn/ui",
  "状态管理": "React Query + Zustand",
  "数据可视化": "D3.js 或 Vis.js",
  "图标": "Lucide React (已安装)",
  "动画": "Framer Motion"
}
```

### API调用封装建议
```typescript
// lib/api.ts
export class ParliamentAPI {
  private baseURL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001' 
    : 'your-production-url';

  async getTopics(): Promise<Topic[]> {
    const response = await fetch(`${this.baseURL}/api/topics`);
    return response.json();
  }

  async createTopic(title: string): Promise<Topic> {
    const response = await fetch(`${this.baseURL}/api/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    return response.json();
  }

  async getTopicTree(id: string): Promise<TopicWithRelations> {
    const response = await fetch(`${this.baseURL}/api/topics/${id}`);
    return response.json();
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const response = await fetch(`${this.baseURL}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    
    if (!response.ok) {
      throw new APIError(response.status, await response.json());
    }
    
    return response.json();
  }
}
```

## 🚀 开发环境设置

### 1. 启动后端服务
```bash
# 确保数据库运行
docker-compose up -d

# 启动开发服务器
npm run dev
# 后端API将在 http://localhost:3001 运行
```

### 2. API测试验证
```bash
# 测试健康检查
curl http://localhost:3001/api/health

# 获取话题列表
curl http://localhost:3001/api/topics

# 创建测试话题
curl -X POST http://localhost:3001/api/topics \
  -H "Content-Type: application/json" \
  -d '{"title":"前端测试话题"}'
```

### 3. 数据库查看
```bash
# 打开Prisma Studio查看数据
npx prisma studio
# 在浏览器访问 http://localhost:5555
```

## 📋 开发优先级建议

### Phase 1: 议会回环模式 (1-2周)
1. **话题列表页面**: 简单列表形式展示话题
2. **议会回环界面**: 实现卡片式的回合制讨论
3. **API集成**: 完整的后端接口对接
4. **基础样式**: 使用Tailwind实现议会风格UI
5. **回合进度指示**: 实现10条评论的进度环

### Phase 2: 智慧树探索模式 (2-3周)  
1. **树状视图切换**: 实现双模式界面切换
2. **智慧树可视化**: D3.js实现交互式树状图
3. **节点导航系统**: 支持在树的任意节点间跳转
4. **路径追溯功能**: 显示完整的讨论演化路径
5. **AI摘要美化**: 结构化展示AI提纯结果

### Phase 3: 体验优化与动画 (1-2周)
1. **议会仪式感**: 发言、AI介入、回合切换的动画
2. **树状图交互**: 缩放、平移、悬停高亮等操作
3. **响应式设计**: 移动端的简化版议会界面
4. **性能优化**: 大型讨论树的渲染优化
5. **用户引导**: 首次访问的功能介绍动画

## 🐛 常见问题和解决方案

### API调用问题
```typescript
// 处理不同的HTTP状态码
const handleAPIError = (status: number, message: string) => {
  switch(status) {
    case 400:
      return '请求参数错误，请检查输入内容';
    case 403:
      return '讨论已锁定，正在生成AI摘要';
    case 404:
      return '请求的资源不存在';
    case 503:
      return 'AI服务暂时不可用，请稍后再试';
    default:
      return '服务器错误，请稍后再试';
  }
};
```

### 状态同步问题
- 评论提交后需要刷新整个话题数据
- 注意话题status的变化（active → locked）
- AI摘要生成需要重新获取话题树结构

## 📞 技术支持

### 项目资源
- **GitHub仓库**: https://github.com/zcanic/council.git
- **技术文档**: 见 `backend_plan.md`
- **API文档**: 本文档API部分
- **数据模型**: 见 `prisma/schema.prisma`

### 调试工具
- **API测试**: 使用Postman或curl测试接口
- **数据库查看**: `npx prisma studio`
- **服务器日志**: 查看终端输出的API调用日志
- **健康检查**: 访问 `/api/health` 确认服务状态

---

**祝前端开发顺利！如有任何问题，请参考项目文档或联系后端开发团队。** 🚀
