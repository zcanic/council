#!/bin/bash
# Parliament Loop 项目快速更新脚本
# 在现有项目目录内运行，用于快速拉取最新代码并重启服务

set -e

echo "🚀 开始Parliament Loop项目快速更新..."
echo "📅 更新时间: $(date)"
echo "📁 当前目录: $(pwd)"

# ================================
# 1. 检查当前目录
# ================================
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    echo "❌ 错误: 请在项目根目录下运行此脚本"
    echo "   期望目录: /www/wwwroot/council.zcanic.xyz"
    exit 1
fi

echo "✅ 项目目录验证通过"

# ================================
# 2. 停止PM2服务
# ================================
echo "🔴 停止PM2服务..."
if pm2 describe parliament-loop > /dev/null 2>&1; then
    pm2 stop parliament-loop
    echo "✅ PM2服务已停止"
else
    echo "⚠️  警告: parliament-loop进程未运行"
fi

# ================================
# 3. 备份当前环境配置
# ================================
echo "💾 备份环境配置..."
if [ -f ".env.production" ]; then
    cp .env.production .env.production.backup
    echo "✅ 环境配置已备份"
else
    echo "⚠️  警告: 未找到.env.production文件"
fi

# ================================
# 4. 拉取最新代码
# ================================
echo "⬇️  拉取最新代码..."
git fetch origin main
git reset --hard origin/main
echo "✅ 代码更新完成"

# ================================
# 5. 恢复环境配置
# ================================
echo "⚙️  恢复环境配置..."
if [ -f ".env.production.backup" ]; then
    mv .env.production.backup .env.production
    echo "✅ 环境配置已恢复"
fi

# ================================
# 6. 安装/更新依赖
# ================================
echo "📦 更新依赖包..."
npm ci --production
echo "✅ 依赖更新完成"

# ================================
# 7. 生成Prisma客户端
# ================================
echo "🗄️  生成Prisma客户端..."
npx prisma generate
echo "✅ Prisma客户端生成完成"

# ================================
# 8. 数据库迁移
# ================================
echo "🗄️  执行数据库迁移..."
npx prisma migrate deploy
echo "✅ 数据库迁移完成"

# ================================
# 9. 构建项目
# ================================
echo "🔨 构建项目..."
npm run build
echo "✅ 项目构建完成"

# ================================
# 10. 重启PM2服务
# ================================
echo "🚀 重启PM2服务..."
if pm2 describe parliament-loop > /dev/null 2>&1; then
    pm2 restart parliament-loop
    echo "✅ PM2服务已重启"
else
    # 如果进程不存在，使用现有的ecosystem.config.js启动
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
        echo "✅ PM2服务已启动"
    else
        echo "❌ 错误: 未找到ecosystem.config.js配置文件"
        exit 1
    fi
fi

# ================================
# 11. 健康检查
# ================================
echo "🏥 进行健康检查..."
sleep 5  # 等待服务启动

for i in {1..20}; do
    if curl -s -f http://localhost:3000/api/health > /dev/null; then
        echo "✅ 健康检查通过"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "⚠️  警告: 健康检查超时，请手动检查日志"
        break
    fi
    sleep 2
done

# ================================
# 12. 显示更新结果
# ================================
echo ""
echo "🎉 Parliament Loop更新完成!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📅 更新时间: $(date)"
echo "📊 PM2状态: $(pm2 describe parliament-loop 2>/dev/null | grep 'status' | awk '{print $4}' || echo 'unknown')"
echo "🌐 端口状态: $(ss -tlnp | grep :3000 | wc -l) 个进程监听3000端口"
echo ""
echo "🔍 验证命令:"
echo "   curl http://localhost:3000/api/health"
echo "   curl http://council.zcanic.xyz/api/health"
echo ""
echo "📊 服务状态:"
pm2 status
echo ""
echo "📝 最近日志 (最后10行):"
pm2 logs parliament-loop --lines 10 --nostream
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
