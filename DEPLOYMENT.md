# Parliament Loop - 部署指南

## 🚀 生产环境部署

### 环境配置

#### 1. 生产环境 `.env` 配置示例：
```bash
# 数据库配置（生产环境）
DATABASE_URL="mysql://username:password@your-db-host:3306/parliament_loop"

# AI服务配置（使用OpenAI或兼容API）
OPENAI_API_KEY="sk-your-real-openai-api-key"
OPENAI_BASE_URL="https://api.openai.com/v1"  # 或其他兼容服务的URL
AI_MODEL_NAME="gpt-4-turbo"  # 或 gpt-3.5-turbo

# 应用配置
NODE_ENV="production"
```

#### 2. 开发环境（本地Ollama）配置：
```bash
# 数据库配置（开发环境）
DATABASE_URL="mysql://council_user:parliament_pass_2024@localhost:3307/parliament_loop"

# AI服务配置（使用本地Ollama）
OPENAI_API_KEY="test-api-key-12345"
OPENAI_BASE_URL="http://localhost:11434/v1"
AI_MODEL_NAME="qwen2:0.5b"

# 应用配置
NODE_ENV="development"
```

## 📋 部署步骤

### 1. 克隆项目
```bash
git clone https://github.com/zcanic/council.git
cd council
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入生产环境配置
```

### 4. 数据库设置
```bash
npx prisma db push
npx prisma generate
```

### 5. 构建项目
```bash
npm run build
```

### 6. 启动生产服务器
```bash
npm start
```

## 🔧 AI服务配置说明

### OpenAI官方API
- **优点**: 高质量、稳定可靠
- **配置**: 使用默认的 `https://api.openai.com/v1`
- **模型推荐**: `gpt-4-turbo` 或 `gpt-3.5-turbo`

### 兼容OpenAI的第三方服务
支持任何符合OpenAI API格式的服务：
- Azure OpenAI
- 本地部署的LLM服务
- 其他兼容服务

### 开发环境（Ollama）
```bash
# 启动Ollama服务
ollama serve

# 下载模型
ollama pull qwen2:0.5b

# 配置环境变量指向本地服务
OPENAI_BASE_URL="http://localhost:11434/v1"
```

## 🔒 安全说明

1. **API密钥管理**: 
   - 生产环境请使用真实的OpenAI API密钥
   - 不要将API密钥提交到版本控制

2. **数据库安全**:
   - 使用强密码
   - 限制数据库访问权限

3. **网络安全**:
   - 使用HTTPS
   - 配置防火墙规则

## 📊 监控和维护

- **健康检查**: `GET /api/health`
- **日志监控**: 查看应用日志
- **数据库监控**: 使用 `npx prisma studio` 管理数据

---

更多详细信息请参考 [README.md](./README.md) 和 [backend_plan.md](./backend_plan.md)。
