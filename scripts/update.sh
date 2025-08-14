#!/bin/bash

# Parliament Loop 服务器一键更新脚本 (优化版)
# 使用方法: ./update.sh

# 进入项目目录
cd /www/wwwroot/council.zcanic.xyz

echo "🔄 开始更新 Parliament Loop..."
echo "📅 更新时间: $(date)"

# 运行诊断
echo "🔍 运行预更新诊断..."
if [ -f scripts/diagnose.sh ]; then
    chmod +x scripts/diagnose.sh
    ./scripts/diagnose.sh > update_diagnostic.log 2>&1
    echo "📋 诊断报告已保存到 update_diagnostic.log"
fi

# 停止应用
echo "📴 停止应用..."
pm2 stop parliament-loop

# 备份当前版本
echo "💾 创建备份..."
git rev-parse HEAD > .last_version
echo "备份版本: $(cat .last_version)"

# 强制同步远程代码
echo "⬇️  强制同步最新代码..."
git fetch origin main
git reset --hard origin/main
echo "✅ 代码同步完成"

# 检查关键文件变化
echo "🔍 检查文件变化..."
if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
    echo "📦 检测到依赖变化，清理并重新安装..."
    rm -rf node_modules package-lock.json
    npm install
elif git diff HEAD~1 HEAD --name-only | grep -q "src/\|components/"; then
    echo "📝 检测到源代码变化，重新安装依赖以确保一致性..."
    npm install
fi

# 检查Prisma变化
if git diff HEAD~1 HEAD --name-only | grep -q "prisma/schema.prisma"; then
    echo "🗄️  检测到数据库模式变化，执行迁移..."
    npx prisma migrate deploy
    npx prisma generate
fi

# 清理构建缓存
echo "🧹 清理构建缓存..."
rm -rf .next

# 构建项目
echo "🔨 构建项目..."
export NODE_ENV=production
npm run build

# 检查构建结果
if [ $? -ne 0 ]; then
    echo "❌ 构建失败，回滚到上一版本..."
    git reset --hard $(cat .last_version)
    npm install
    npm run build
    pm2 start parliament-loop
    echo "🔙 已回滚到安全版本"
    exit 1
fi

# 重启应用
echo "🚀 重启应用..."
pm2 start parliament-loop

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 5

# 健康检查
echo "🏥 执行健康检查..."
for i in {1..10}; do
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo "✅ 应用启动成功"
        break
    elif [ $i -eq 10 ]; then
        echo "❌ 应用启动失败，检查日志"
        pm2 logs parliament-loop --lines 20
        exit 1
    else
        echo "⏳ 等待启动中... ($i/10)"
        sleep 3
    fi
done

# 检查外部访问
echo "🌐 检查外部访问..."
if curl -s https://council.zcanic.xyz/api/health > /dev/null; then
    echo "✅ 外部访问正常"
else
    echo "⚠️  外部访问可能有问题，请检查 Nginx 配置"
fi

# 显示状态
echo "📊 当前状态:"
pm2 status
echo ""
echo "📝 最新日志:"
pm2 logs parliament-loop --lines 10

# 清理备份文件
rm -f .last_version

echo ""
echo "🎉 更新完成！"
echo "🌐 访问地址: https://council.zcanic.xyz"
echo "📋 如有问题，请查看 update_diagnostic.log 诊断报告"
