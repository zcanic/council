# Parliament Loop - Docker 部署指南
## 域名: council.zcanic.xyz

本指南提供了使用 Docker 和 Docker Compose 部署 Parliament Loop 应用的完整步骤。

## 🎯 Docker 部署优势

✅ **免手动创建数据库** - Docker Compose 自动创建 MySQL 数据库  
✅ **环境一致性** - 开发、测试、生产环境完全一致  
✅ **简化部署** - 一条命令完成整个应用栈部署  
✅ **服务隔离** - 每个服务### AI 服务管理

```bash
# 测试 Moonshot AI API 连接
curl -s --connect-timeout 5 https://api.moonshot.cn

# 检查 API Key 配置
docker-compose exec app printenv | grep OPENAI

# 测试 API 调用
curl -X POST https://api.moonshot.cn/v1/chat/completions \
  -H "Authorization: Bearer sk-aC6UVaONEdVIw0lEf1RUmZtw8CuHHkZRm1v2e3XJ3oADIgad" \
  -H "Content-Type: application/json" \
  -d '{"model": "kimi-k2-0711-preview", "messages": [{"role": "user", "content": "Hello"}]}'
``` **自动重启** - 服务异常时自动重启  

## 📋 系统要求

- **操作系统**: Linux (推荐 Ubuntu 20.04+)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 2GB+
- **磁盘**: 5GB+
- **端口**: 3000, 3306, 11434

## 🚀 快速部署

### 1. 安装 Docker 和 Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 添加用户到 docker 组
sudo usermod -aG docker $USER
newgrp docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 克隆项目

```bash
git clone https://github.com/zcanic/council.git
cd council
```

### 3. 一键部署

```bash
# 标准部署
./deploy-docker.sh

# 清理旧镜像后部署
./deploy-docker.sh --clean
```

## 📊 服务架构

Docker Compose 会启动以下服务：

| 服务名 | 容器名 | 端口 | 描述 |
|--------|--------|------|------|
| `app` | `council-app` | 3000 | Next.js 应用 |
| `db` | `council-mysql` | 3306 | MySQL 8.0 数据库 |

**AI 服务**: 使用 Moonshot AI (Kimi) 云服务

## 🔧 配置说明

### 环境变量 (docker-compose.yml)

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=mysql://council_user:parliament_pass_2024@db:3306/parliament_loop
  - NEXT_PUBLIC_API_URL=http://council.zcanic.xyz
  - OPENAI_API_KEY=sk-aC6UVaONEdVIw0lEf1RUmZtw8CuHHkZRm1v2e3XJ3oADIgad
  - OPENAI_BASE_URL=https://api.moonshot.cn/v1
  - AI_MODEL_NAME=kimi-k2-0711-preview
  - PORT=3000
```

### 数据库配置

Docker 自动创建：
- **数据库名**: `parliament_loop`
- **用户名**: `council_user`
- **密码**: `parliament_pass_2024`
- **Root密码**: `council_root_2024!`

## 🌐 Nginx 反向代理配置

### 1. 安装 Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. 配置站点

```bash
# 复制配置文件
sudo cp nginx-docker.conf /etc/nginx/sites-available/council.zcanic.xyz

# 启用站点
sudo ln -s /etc/nginx/sites-available/council.zcanic.xyz /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

### 3. 防火墙配置

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

## 📝 常用操作命令

### 查看服务状态

```bash
docker-compose ps
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看应用日志
docker-compose logs -f app

# 查看数据库日志
docker-compose logs -f db

# 查看 AI 服务日志
docker-compose logs -f ollama
```

### 服务管理

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 重启特定服务
docker-compose restart app
```

### 进入容器

```bash
# 进入应用容器
docker-compose exec app sh

# 进入数据库容器
docker-compose exec db bash

# 连接数据库
docker-compose exec db mysql -u council_user -p parliament_loop
```

### 数据库操作

```bash
# 运行数据库迁移
docker-compose exec app npx prisma db push

# 重置数据库
docker-compose exec app npx prisma db push --accept-data-loss

# 查看数据库结构
docker-compose exec app npx prisma studio
```

### AI 服务管理

```bash
# 测试 Google Gemini API 连接
curl -s --connect-timeout 5 https://generativelanguage.googleapis.com

# 检查 API Key 配置
docker-compose exec app printenv | grep OPENAI
```

## 📂 数据持久化

Docker Compose 使用命名卷存储数据：

```yaml
volumes:
  mysql-data:    # MySQL 数据
```

**注意**: AI 服务使用 Moonshot AI 云服务，无需本地存储。

### 备份数据

```bash
# 备份数据库
docker-compose exec db mysqldump -u root -p parliament_loop > backup_$(date +%Y%m%d).sql

# 备份 Docker 卷
docker run --rm -v council_mysql-data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### 恢复数据

```bash
# 恢复数据库
docker-compose exec -T db mysql -u root -p parliament_loop < backup_20240813.sql
```

## 🔍 故障排除

### 1. 容器无法启动

```bash
# 查看容器状态
docker-compose ps

# 查看错误日志
docker-compose logs [service_name]

# 重建容器
docker-compose up --build -d
```

### 2. 数据库连接失败

```bash
# 检查数据库容器状态
docker-compose exec db mysqladmin ping -h localhost

# 检查数据库用户
docker-compose exec db mysql -u root -p -e "SELECT user, host FROM mysql.user;"
```

### 3. 应用无法访问

```bash
# 检查端口占用
netstat -tlnp | grep :3000

# 检查防火墙
sudo ufw status

# 测试应用响应
curl -I http://localhost:3000
```

### 4. AI 服务问题

```bash
# 检查 Moonshot AI API 连接
curl -s --connect-timeout 5 https://api.moonshot.cn

# 验证 API Key 配置
docker-compose exec app printenv | grep OPENAI

# 测试 API 调用
curl -X POST https://api.moonshot.cn/v1/chat/completions \
  -H "Authorization: Bearer sk-aC6UVaONEdVIw0lEf1RUmZtw8CuHHkZRm1v2e3XJ3oADIgad" \
  -H "Content-Type: application/json" \
  -d '{"model": "kimi-k2-0711-preview", "messages": [{"role": "user", "content": "test"}]}'
```

## 🔄 更新部署

### 1. 更新代码

```bash
git pull origin main
```

### 2. 重新构建

```bash
docker-compose build app
docker-compose up -d
```

### 3. 数据库迁移

```bash
docker-compose exec app npx prisma db push
```

## 🛡️ 安全建议

1. **修改默认密码**：更改数据库密码
2. **网络隔离**：使用 Docker 网络隔离
3. **日志轮转**：配置日志轮转避免磁盘占满
4. **定期备份**：设置自动备份计划
5. **监控告警**：配置服务监控

## 📊 性能优化

1. **资源限制**：为容器设置内存和 CPU 限制
2. **缓存配置**：优化 Nginx 缓存策略
3. **数据库调优**：根据负载调整 MySQL 配置
4. **镜像优化**：使用多阶段构建减少镜像大小

## 📞 技术支持

如果遇到问题，请：

1. 查看服务日志：`docker-compose logs -f`
2. 检查服务状态：`docker-compose ps`
3. 验证网络连接：`curl -I http://localhost:3000`
4. 查阅 Docker 和 Next.js 官方文档

---

**部署成功后访问**: http://council.zcanic.xyz
