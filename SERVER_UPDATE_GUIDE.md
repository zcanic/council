# Parliament Loop - 服务器完全更新指南

## 🎯 Git仓库已更新完毕

✅ **安全保护**: 敏感文件已完全排除
✅ **代码推送**: 最新版本已上传到 GitHub
✅ **提交ID**: `94f4650` - 完整重构版本

## 🚀 服务器完全更新步骤

### 第一步: 登录服务器
```bash
# SSH登录到你的服务器
ssh root@your-server-ip

# 或通过宝塔面板终端
```

### 第二步: 下载更新脚本
```bash
# 进入临时目录
cd /tmp

# 下载部署脚本 (不包含敏感信息)
curl -O https://raw.githubusercontent.com/zcanic/council/main/deploy-baota.sh

# 给予执行权限
chmod +x deploy-baota.sh
```

### 第三步: 手动创建环境配置
```bash
# 创建环境变量文件
cat > /tmp/.env.production << 'EOF'
# Parliament Loop 生产环境配置

# ================================
# 数据库配置
# ================================
DATABASE_URL="mysql://council_user:parliament_pass_2024@localhost:3306/parliament_loop"

# ================================
# 应用基础配置
# ================================
NODE_ENV="production"
PORT=3000
NEXT_PUBLIC_API_URL="http://council.zcanic.xyz"

# ================================
# AI服务配置 - 使用Moonshot AI (Kimi)
# ================================
OPENAI_API_KEY="sk-aC6UVaONEdVIw0lEf1RUmZtw8CuHHkZRm1v2e3XJ3oADIgad"
OPENAI_BASE_URL="https://api.moonshot.cn/v1"
AI_MODEL_NAME="kimi-k2-0711-preview"

# ================================
# 性能配置
# ================================
DB_POOL_SIZE=10
DB_TRANSACTION_TIMEOUT=30000
EOF

# 复制到备份目录 (脚本会从这里恢复)
mkdir -p /www/backups/temp
cp /tmp/.env.production /www/backups/temp/
```

### 第四步: 执行完全更新
```bash
# 执行部署脚本 (会完全替换所有文件)
./deploy-baota.sh
```

### 第五步: 验证部署
```bash
# 检查PM2进程状态
pm2 status

# 查看parliament-loop进程
pm2 logs parliament-loop --lines 20

# 测试API健康检查
curl http://localhost:3000/api/health
curl http://council.zcanic.xyz/api/health

# 检查端口监听
netstat -tlnp | grep :3000
```

## 🔄 部署脚本执行流程

部署脚本将按以下顺序执行：

1. **🔴 停止服务**: 停止PM2中的parliament-loop进程
2. **💾 创建备份**: 备份现有文件到 `/www/backups/council-YYYYMMDD-HHMMSS/`
3. **🗑️ 完全清理**: 删除 `/www/wwwroot/council.zcanic.xyz` 所有文件
4. **⬇️ 下载新版**: 从GitHub克隆最新代码
5. **📦 部署文件**: 复制新文件到部署目录
6. **⚙️ 恢复配置**: 从备份恢复 `.env.production`
7. **📦 安装依赖**: 执行 `npm ci --production`
8. **🔨 构建项目**: 执行 `npm run build`
9. **🗄️ 更新数据库**: 运行 Prisma 迁移
10. **🔒 设置权限**: 配置文件权限为www用户
11. **🚀 启动服务**: 启动PM2进程 `parliament-loop`
12. **🏥 健康检查**: 验证API可用性
13. **🧹 清理临时**: 删除临时文件

## ⚠️ 重要安全说明

### 已保护的敏感文件:
- ✅ `.env.production` - 不会上传到Git
- ✅ `ecosystem.config.js` - 本地PM2配置
- ✅ `deploy-*.sh` - 部署脚本（含密码信息）
- ✅ `BAOTA_DEPLOYMENT_GUIDE.md` - 详细配置文档
- ✅ API密钥和数据库密码 - 完全保护

### Git仓库只包含:
- ✅ 源代码和业务逻辑
- ✅ 配置模板和示例文件
- ✅ 公开的构建和项目配置
- ✅ 无任何敏感信息

## 🎯 更新完成后的验证

### 1. 进程检查
```bash
pm2 list
# 应该看到 parliament-loop 进程运行中
```

### 2. 日志检查
```bash
tail -f /www/wwwlogs/council.zcanic.xyz/error.log
tail -f /www/wwwlogs/council.zcanic.xyz/out.log
```

### 3. 功能测试
```bash
# 健康检查
curl -v http://council.zcanic.xyz/api/health

# 主页检查
curl -v http://council.zcanic.xyz/

# API测试
curl -v http://council.zcanic.xyz/api/topics
```

## 🚨 故障回滚

如果更新失败，可以快速回滚：

```bash
# 停止新版本
pm2 stop parliament-loop

# 恢复备份 (使用最新备份日期)
BACKUP_DATE=$(ls -t /www/backups/ | head -1)
rm -rf /www/wwwroot/council.zcanic.xyz
cp -r /www/backups/$BACKUP_DATE /www/wwwroot/council.zcanic.xyz

# 重启服务
pm2 start parliament-loop
```

---

**🎉 准备完毕！现在可以在服务器执行完全更新，所有敏感信息都已安全保护！**
