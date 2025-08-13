# 🚀 快速部署指南

## Docker 一键部署（推荐）

```bash
# 1. 进入部署目录
cd deployment

# 2. 启动所有服务
docker-compose up -d

# 3. 访问应用
open http://localhost:3000
```

## 手动部署

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件设置数据库连接等

# 3. 构建和启动
npm run build
npm start
```

## 部署配置文件

- `deployment/docker-compose.yml` - Docker 部署配置
- `deployment/ecosystem.config.js` - PM2 进程管理配置
- `deployment/deploy.sh` - 自动部署脚本
- `deployment/nginx.conf` - Nginx 反向代理配置

## 详细部署文档

请查看 `documentation/DEPLOYMENT.md` 获取完整的部署说明和配置选项。

## 环境要求

- Node.js 18+
- MySQL 8.0
- Docker & Docker Compose（Docker 部署）

## 生产环境部署

对于生产环境部署，请参考：
- `documentation/DEPLOYMENT_council.zcanic.xyz.md` - 生产部署指南
- `documentation/DEPLOYMENT_DOCKER.md` - Docker 生产部署
