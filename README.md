
# 议会回环 - Parliament Loop

> **一个能把10条讨论自动总结成1条智慧的AI对话系统**  
> 每当第10条评论发出时，AI自动总结，开启下一轮讨论

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.17-2D3748)](https://prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1)](https://mysql.com/)
[![Ollama](https://img.shields.io/badge/AI-Ollama-00ADD8)](https://ollama.ai/)

## 🎯 项目概述

**Parliament Loop（议会回环）**是一个创新的AI驱动讨论系统，通过"智慧提纯"技术将分散的观点整合为结构化的集体智慧。

### 核心机制：智慧提纯
- 📝 **10条评论触发**：当任何话题收集到10条评论时，系统自动锁定
- 🤖 **AI智能摘要**：使用本地AI模型提取共识、分歧和新问题  
- 🌳 **智慧之树**：每次摘要成为新的讨论起点，形成无限递归的智慧结构
- 🔄 **循环进化**：话题→评论→摘要→新话题，持续深化认知

## ✨ 项目特色

### 🏗️ 技术架构
- **全栈一体化**：Next.js 14 + TypeScript，前后端统一开发体验
- **功能切片架构**：按领域划分代码模块，职责清晰易维护
- **类型安全**：Zod验证 + Prisma ORM，全链路类型保护
- **本地AI集成**：Ollama支持，无需依赖外部API服务

### 🛡️ 质量保证
- **事务完整性**：评论创建和AI摘要原子化操作
- **统一错误处理**：自定义异常体系，优雅处理各种边界情况
- **输入验证**：全面的数据验证和清理机制
- **配置驱动**：环境变量统一管理，支持多环境部署

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Docker & Docker Compose
- Ollama（用于本地AI服务）

### 1️⃣ 安装依赖
```bash
git clone <repository-url>
cd parliament-loop
npm install
```

### 2️⃣ 启动服务
```bash
# 启动MySQL数据库
docker-compose up -d

# 启动Ollama AI服务
ollama serve
ollama pull qwen2:0.5b  # 下载轻量AI模型
```

### 3️⃣ 配置环境
```bash
# 复制环境配置
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 数据库配置
DATABASE_URL="mysql://council_user:parliament_pass_2024@localhost:3307/parliament_loop"

# AI服务配置（使用本地Ollama）
OPENAI_API_KEY="test-api-key-12345"
OPENAI_BASE_URL="http://localhost:11434/v1"
AI_MODEL_NAME="qwen2:0.5b"

# 应用配置
NODE_ENV="development"
```

### 4️⃣ 初始化数据库
```bash
npx prisma db push
npx prisma generate
npx prisma db seed  # 可选：添加示例数据
```

### 5️⃣ 启动应用
```bash
npm run dev
```

🎉 访问 `http://localhost:3001` 开始体验！

## 📊 开发状态

### ✅ 后端功能（100%完成）
- [x] **API端点完整**：话题管理、评论系统、健康检查
- [x] **数据模型完善**：支持完整的智慧树结构
- [x] **AI集成验证**：Ollama本地服务集成测试通过
- [x] **智慧提纯机制**：10评论触发→AI摘要→话题锁定
- [x] **错误处理体系**：统一异常处理和HTTP状态码映射
- [x] **数据库事务**：评论创建和摘要生成的原子性操作

### 🚧 前端功能（待开发）
- [ ] **用户界面**：话题列表、评论界面、摘要展示
- [ ] **智慧之树可视化**：图形化展示讨论结构
- [ ] **实时更新**：WebSocket集成
- [ ] **移动端适配**：响应式设计
- [ ] **用户认证**：身份验证和权限管理

## 📁 项目结构

```
parliament-loop/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 api/                # API路由层
│   │   │   ├── 📁 topics/         # 话题相关API
│   │   │   ├── 📁 comments/       # 评论相关API
│   │   │   └── 📁 health/         # 健康检查
│   │   ├── layout.tsx             # 根布局组件
│   │   └── page.tsx               # 首页组件
│   ├── 📁 features/               # 功能模块（核心业务逻辑）
│   │   ├── 📁 topics/             # 话题功能
│   │   ├── 📁 comments/           # 评论功能
│   │   └── 📁 summaries/          # 摘要功能
│   ├── 📁 lib/                    # 基础库
│   │   ├── config.ts              # 配置管理
│   │   ├── exceptions.ts          # 异常处理
│   │   └── prisma.ts              # 数据库客户端
│   └── 📁 styles/                 # 样式文件
├── 📁 prisma/                     # 数据库相关
│   ├── schema.prisma              # 数据模型定义
│   └── seed.ts                    # 初始数据
├── 📁 tests/                      # 测试文件
├── 📁 docs/                       # 项目文档
├── docker-compose.yml             # Docker配置
├── package.json                   # 项目依赖
└── README.md                      # 项目文档
```

## �️ 核心命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 运行生产服务器 |
| `npm run lint` | 代码质量检查 |
| `npm test` | 运行单元测试 |
| `npx prisma studio` | 打开数据库管理界面 |
| `npx prisma db push` | 同步数据库结构 |
| `npx prisma db seed` | 重置并填充测试数据 |

## 🔧 技术细节

### 数据模型设计
```prisma
model Topic {
  id        String     @id @default(cuid())
  title     String
  status    String     @default("active") // active | locked
  createdAt DateTime   @default(now())
  comments  Comment[]
  summaries Summary[]
}

model Comment {
  id        String    @id @default(cuid())
  content   String    @db.Text
  author    String?
  topicId   String?   // 关联到Topic
  summaryId String?   // 关联到Summary
}

model Summary {
  id        String    @id @default(cuid())
  content   String    @db.Text
  metadata  Json?     // AI返回的完整数据
  topicId   String    // 根话题ID
  parentId  String?   // 父摘要ID（支持无限嵌套）
}
```

### AI提示词工程
```
你是一个绝对中立、逻辑严谨、精通信息提纯的"书记官"。
请将10条评论总结为JSON格式，包含：
- consensus: 核心共识
- disagreements: 主要分歧点
- new_questions: 有价值的新问题
```

### API接口设计
- `GET /api/topics` - 获取所有话题列表
- `POST /api/topics` - 创建新话题
- `GET /api/topics/[id]` - 获取完整智慧树结构
- `POST /api/comments` - 提交评论（可能触发AI摘要）
- `GET /api/health` - 系统健康检查

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🎖️ 致谢

- **Next.js团队** - 出色的全栈框架
- **Prisma团队** - 类型安全的ORM
- **Ollama社区** - 本地AI服务支持
- **所有贡献者** - 让智慧提纯成为现实

---

<div align="center">

**Parliament Loop - 让集体智慧循环进化**

[🌐 在线演示](https://parliament-loop.example.com) • [📖 完整文档](./docs/) • [🐛 问题反馈](https://github.com/your-repo/issues)

</div>

