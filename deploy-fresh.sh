#!/bin/bash
# Parliament Loop 完全重新部署脚本
# 删除所有文件（除数据库外）重新开始

set -e

echo "🚀 开始Parliament Loop完全重新部署..."
echo "⚠️  警告：这将删除所有现有文件（除数据库外）"
read -p "确认继续吗？(y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "❌ 部署取消"
    exit 0
fi

# ================================
# 配置变量
# ================================
REPO_URL="https://github.com/zcanic/council.git"
DEPLOY_DIR="/www/wwwroot/council.zcanic.xyz"
BACKUP_DIR="/www/backups/council-fresh-$(date +%Y%m%d-%H%M%S)"
TEMP_DIR="/tmp/council-fresh-$(date +%s)"
PM2_APP_NAME="parliament-loop"

echo "📅 部署时间: $(date)"
echo "📁 部署目录: $DEPLOY_DIR"
echo "💾 备份目录: $BACKUP_DIR"

# ================================
# 1. 停止并删除PM2服务
# ================================
echo "🔴 停止并删除PM2服务..."
if pm2 describe $PM2_APP_NAME > /dev/null 2>&1; then
    pm2 stop $PM2_APP_NAME
    pm2 delete $PM2_APP_NAME
    echo "✅ PM2服务已停止并删除"
else
    echo "ℹ️  PM2服务未运行"
fi

# ================================
# 2. 备份重要文件
# ================================
echo "💾 备份重要配置文件..."
mkdir -p "$BACKUP_DIR"
if [ -d "$DEPLOY_DIR" ]; then
    # 备份环境配置文件
    cp "$DEPLOY_DIR/.env.production" "$BACKUP_DIR/" 2>/dev/null || echo "  未找到.env.production"
    cp "$DEPLOY_DIR/ecosystem.config.js" "$BACKUP_DIR/" 2>/dev/null || echo "  未找到ecosystem.config.js"
    
    # 备份自定义配置
    cp -r "$DEPLOY_DIR/.git" "$BACKUP_DIR/" 2>/dev/null || echo "  未找到.git目录"
    
    echo "✅ 配置文件已备份到: $BACKUP_DIR"
else
    echo "ℹ️  目录不存在，无需备份"
fi

# ================================
# 3. 完全删除现有文件
# ================================
echo "🗑️  完全删除现有文件..."
if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR"
    echo "✅ 现有文件已完全删除"
fi

# 重新创建部署目录
mkdir -p "$DEPLOY_DIR"
mkdir -p "/www/wwwlogs/council.zcanic.xyz"

# ================================
# 4. 克隆最新代码
# ================================
echo "⬇️  克隆最新代码..."
git clone "$REPO_URL" "$TEMP_DIR"
cd "$TEMP_DIR"
echo "✅ 最新代码已下载"

# ================================
# 5. 部署代码文件
# ================================
echo "📦 部署代码文件..."
cp -r * "$DEPLOY_DIR/"
cp -r .[^.]* "$DEPLOY_DIR/" 2>/dev/null || true
cd "$DEPLOY_DIR"
echo "✅ 代码文件已部署"

# ================================
# 6. 设置文件权限
# ================================
echo "🔒 设置文件权限..."
chown -R www:www "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"
echo "✅ 文件权限已设置"

# ================================
# 7. 配置数据库连接
# ================================
echo "🗄️  确认数据库配置..."
# 不删除数据库，只确认连接
mysql -u root -p << 'EOF'
USE parliament_loop;
SHOW TABLES;
EXIT;
EOF
echo "✅ 数据库连接确认完成"

# ================================
# 8. 创建生产环境配置
# ================================
echo "⚙️  创建生产环境配置..."
cat > "$DEPLOY_DIR/.env.production" << 'EOF'
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

chmod 600 "$DEPLOY_DIR/.env.production"
chown www:www "$DEPLOY_DIR/.env.production"
echo "✅ 生产环境配置已创建"

# ================================
# 9. 安装依赖
# ================================
echo "📦 安装Node.js依赖..."
# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  警告: Node.js版本 ($NODE_VERSION) 可能过低，推荐18+"
fi

npm install --production
echo "✅ 依赖安装完成"

# ================================
# 10. 生成Prisma客户端
# ================================
echo "🔧 生成Prisma客户端..."
npx prisma generate
echo "✅ Prisma客户端生成完成"

# ================================
# 11. 应用数据库迁移（如果有新的）
# ================================
echo "📊 应用数据库迁移..."
npx prisma migrate deploy
echo "✅ 数据库迁移完成"

# ================================
# 12. 构建生产版本
# ================================
echo "🔨 构建生产版本..."
npm run build
echo "✅ 生产版本构建完成"

# ================================
# 13. 创建PM2配置
# ================================
echo "🚀 创建PM2配置..."
cat > "$DEPLOY_DIR/ecosystem.config.js" << 'EOF'
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
    max_memory_restart: '1G',
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

# ================================
# 14. 启动PM2服务
# ================================
echo "▶️  启动PM2服务..."
pm2 start ecosystem.config.js
pm2 save
echo "✅ PM2服务已启动"

# ================================
# 15. 健康检查
# ================================
echo "🏥 进行健康检查..."
sleep 15  # 给应用更多启动时间

HEALTH_CHECK_PASSED=false
for i in {1..30}; do
    if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ 健康检查通过！"
        HEALTH_CHECK_PASSED=true
        break
    fi
    echo "  尝试 $i/30 - 等待应用启动..."
    sleep 3
done

if [ "$HEALTH_CHECK_PASSED" = false ]; then
    echo "❌ 健康检查失败"
    echo "📋 调试信息:"
    echo "PM2状态:"
    pm2 status
    echo ""
    echo "PM2日志 (最后20行):"
    pm2 logs $PM2_APP_NAME --lines 20
    echo ""
    echo "错误日志:"
    tail -20 /www/wwwlogs/council.zcanic.xyz/error.log 2>/dev/null || echo "无错误日志"
    
    echo ""
    echo "🔧 调试命令:"
    echo "   pm2 logs $PM2_APP_NAME"
    echo "   curl -v http://localhost:3000/api/health"
    echo "   tail -f /www/wwwlogs/council.zcanic.xyz/error.log"
fi

# ================================
# 16. 清理临时文件
# ================================
echo "🧹 清理临时文件..."
rm -rf "$TEMP_DIR"
echo "✅ 临时文件清理完成"

# ================================
# 17. 部署结果
# ================================
echo ""
echo "🎉 Parliament Loop 完全重新部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 部署目录: $DEPLOY_DIR"
echo "💾 备份位置: $BACKUP_DIR"
echo "🗄️  数据库: parliament_loop (已保留现有数据)"
echo "🌐 PM2状态: $(pm2 describe $PM2_APP_NAME 2>/dev/null | grep 'status' | awk '{print $4}' || echo '未知')"
echo "📊 端口状态: $(ss -tlnp | grep :3000 | wc -l) 个进程监听3000端口"
echo ""

if [ "$HEALTH_CHECK_PASSED" = true ]; then
    echo "✅ 应用状态: 运行正常"
    echo "🌐 访问地址: http://council.zcanic.xyz"
    echo "🔍 API健康: http://council.zcanic.xyz/api/health"
else
    echo "⚠️  应用状态: 需要检查"
    echo "🔧 请使用调试命令检查问题"
fi

echo ""
echo "📝 后续配置:"
echo "   1. 宝塔面板反向代理: localhost:3000 → council.zcanic.xyz"
echo "   2. SSL证书配置 (推荐)"
echo "   3. 防火墙规则检查"
echo ""
echo "🔍 验证命令:"
echo "   curl http://council.zcanic.xyz/api/health"
echo "   pm2 status"
echo "   pm2 logs $PM2_APP_NAME"
echo ""
echo "🗑️  清理备份 (确认无问题后):"
echo "   rm -rf $BACKUP_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
