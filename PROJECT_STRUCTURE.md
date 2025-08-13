# Parliament Loop - 项目结构说明

## 📁 目录结构

```
council/
├── 📱 src/                          # 源代码目录
│   ├── app/                         # Next.js App Router页面和API路由
│   │   ├── api/                     # API路由
│   │   │   ├── comments/            # 评论相关API
│   │   │   ├── topics/              # 话题相关API
│   │   │   └── health/              # 健康检查API
│   │   ├── layout.tsx               # 全局布局
│   │   └── page.tsx                 # 首页
│   ├── components/                  # React组件
│   │   ├── lobby/                   # 大厅相关组件
│   │   ├── topic/                   # 话题相关组件
│   │   └── ui/                      # 通用UI组件
│   ├── features/                    # 功能模块
│   │   ├── comments/                # 评论功能
│   │   ├── summaries/               # 总结功能
│   │   └── topics/                  # 话题功能
│   ├── lib/                         # 工具库
│   └── types/                       # TypeScript类型定义
│
├── 🚀 deployment/                   # 部署配置
│   ├── docker-compose.yml          # Docker部署配置
│   ├── ecosystem.config.js         # PM2配置
│   ├── deploy.sh                    # 部署脚本
│   ├── Dockerfile                   # Docker镜像配置
│   └── nginx.conf                   # Nginx配置
│
├── 📚 documentation/                # 项目文档
│   ├── DEPLOYMENT.md                # 部署指南
│   ├── FRONTEND_GUIDE.md            # 前端开发指南
│   ├── PARLIAMENT_ARCHITECTURE.md  # 架构说明
│   └── c-roadmap.txt                # 项目路线图
│
├── 🧪 tests/                       # 测试文件
│   ├── unit/                        # 单元测试
│   ├── integration/                 # 集成测试
│   └── e2e/                         # 端到端测试
│
├── 🗄️ prisma/                      # 数据库配置
│   └── schema.prisma                # 数据库模型
│
├── 📦 public/                       # 静态资源
├── ⚙️  配置文件
│   ├── package.json                 # 项目配置
│   ├── next.config.mjs              # Next.js配置
│   ├── tailwind.config.js           # Tailwind CSS配置
│   ├── tsconfig.json                # TypeScript配置
│   ├── jest.config.js               # Jest测试配置
│   └── .env.example                 # 环境变量示例
│
└── 📝 README.md                     # 项目主README
```

## 🎯 核心目录说明

### `src/` - 源代码
- **app/**: Next.js 14 App Router的页面和API路由
- **components/**: React组件，按功能模块分组
- **features/**: 业务功能模块，每个模块包含service、validation等
- **lib/**: 通用工具库和配置

### `deployment/` - 部署配置
- 所有与部署相关的配置文件和脚本
- 支持Docker、PM2、Nginx等多种部署方式

### `documentation/` - 项目文档
- 开发指南、架构说明、部署文档等
- 保持文档与代码的同步更新

### `tests/` - 测试文件
- 按测试类型分组：单元测试、集成测试、端到端测试

## 🔧 开发工作流

1. **开发**: 在 `src/` 目录下编写代码
2. **测试**: 在 `tests/` 目录下编写和运行测试
3. **文档**: 在 `documentation/` 目录下维护文档
4. **部署**: 使用 `deployment/` 目录下的配置进行部署

## 📋 文件命名规范

- **组件文件**: PascalCase (如 `TopicSpace.tsx`)
- **服务文件**: camelCase + .service.ts (如 `topic.service.ts`) 
- **类型文件**: camelCase + .types.ts (如 `api.types.ts`)
- **测试文件**: 文件名 + .test.ts (如 `topic.service.test.ts`)

这个结构确保了：
✅ 代码组织清晰
✅ 功能模块分离
✅ 配置文件集中管理
✅ 文档易于维护
✅ 测试结构完整
