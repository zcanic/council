#!/bin/bash
# Parliament Loop 简化重新部署脚本
# 稳定版本 - 避免工作目录问题

set -e

echo "🚀 Parliament Loop 简化重新部署..."
echo "⚠️  这将重新部署应用（保留数据库）"

# ================================
# 配置变量
# ================================
REPO_URL="https://github.com/zcanic/council.git"
DEPLOY_DIR="/www/wwwroot/council.zcanic.xyz"
BACKUP_DIR="/www/backups/council-$(date +%Y%m%d-%H%M%S)"
PM2_APP_NAME="parliament-loop"

# 确保在安全的工作目录
cd /root

echo "📅 部署时间: $(date)"
echo "📁 部署目录: $DEPLOY_DIR"

# ================================
# 1. 停止PM2服务
# ================================
echo "🔴 停止PM2服务..."
if pm2 describe $PM2_APP_NAME > /dev/null 2>&1; then
    pm2 stop $PM2_APP_NAME
    pm2 delete $PM2_APP_NAME
    echo "✅ PM2服务已停止"
else
    echo "ℹ️  PM2服务未运行"
fi

# ================================
# 2. 备份配置文件
# ================================
echo "💾 备份配置文件..."
mkdir -p "$BACKUP_DIR"
if [ -f "$DEPLOY_DIR/.env.production" ]; then
    cp "$DEPLOY_DIR/.env.production" "$BACKUP_DIR/"
    echo "✅ 已备份 .env.production"
fi

# ================================
# 3. 清理旧文件
# ================================
echo "🗑️  清理旧文件..."
if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR"
fi
mkdir -p "$DEPLOY_DIR"
mkdir -p "/www/wwwlogs/council.zcanic.xyz"
echo "✅ 旧文件已清理"

# ================================
# 4. 下载新代码
# ================================
echo "⬇️  下载最新代码..."
# 直接克隆到部署目录
git clone "$REPO_URL" "$DEPLOY_DIR"
cd "$DEPLOY_DIR"
echo "✅ 最新代码已下载"

# ================================
# 5. 恢复配置文件
# ================================
echo "⚙️  恢复配置文件..."
if [ -f "$BACKUP_DIR/.env.production" ]; then
    cp "$BACKUP_DIR/.env.production" "$DEPLOY_DIR/"
    echo "✅ 配置文件已恢复"
else
    echo "📝 创建新的配置文件..."
    cat > .env.production << 'EOF'
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
    echo "✅ 新配置文件已创建"
fi

# ================================
# 6. 设置权限
# ================================
echo "🔒 设置文件权限..."
chown -R www:www "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"
chmod 600 "$DEPLOY_DIR/.env.production"
echo "✅ 权限设置完成"

# ================================
# 7. 安装依赖
# ================================
echo "📦 安装依赖..."
npm install --production
echo "✅ 依赖安装完成"

# ================================
# 8. Prisma配置
# ================================
echo "🔧 配置Prisma..."
npx prisma generate
npx prisma migrate deploy
echo "✅ Prisma配置完成"

# ================================
# 9. 构建项目
# ================================
echo "🔨 构建项目..."
npm run build
echo "✅ 项目构建完成"

# ================================
# 10. 创建PM2配置
# ================================
echo "⚙️  创建PM2配置..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'parliament-loop',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/council.zcanic.xyz',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/www/wwwlogs/council.zcanic.xyz/error.log',
    out_file: '/www/wwwlogs/council.zcanic.xyz/out.log',
    log_file: '/www/wwwlogs/council.zcanic.xyz/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF
echo "✅ PM2配置已创建"

# ================================
# 11. 启动服务
# ================================
echo "🚀 启动PM2服务..."
pm2 start ecosystem.config.js
pm2 save
echo "✅ 服务已启动"

# ================================
# 12. 健康检查
# ================================
echo "🏥 健康检查..."
sleep 10

HEALTH_OK=false
for i in {1..20}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ 健康检查通过！"
        HEALTH_OK=true
        break
    fi
    echo "  检查中 ($i/20)..."
    sleep 3
done

# ================================
# 13. 显示结果
# ================================
echo ""
echo "🎉 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 部署目录: $DEPLOY_DIR"
echo "💾 备份位置: $BACKUP_DIR"

if [ "$HEALTH_OK" = true ]; then
    echo "✅ 应用状态: 运行正常"
    echo "🌐 访问地址: http://council.zcanic.xyz"
else
    echo "⚠️  应用状态: 需要检查"
    echo ""
    echo "🔧 调试命令:"
    echo "   pm2 logs $PM2_APP_NAME"
    echo "   pm2 status"
    echo "   curl -v http://localhost:3000/api/health"
    echo ""
    echo "📋 当前PM2状态:"
    pm2 status
fi

echo ""
echo "🔍 验证命令:"
echo "   pm2 status"
echo "   curl http://council.zcanic.xyz/api/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
