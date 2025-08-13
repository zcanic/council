#!/bin/bash

# 快速更新服务器配置脚本
# 用于修复数据库事务超时问题

echo "🚀 开始更新服务器配置..."

# 1. 提交并推送当前更改
echo "📤 提交并推送更改..."
git add .env.production src/features/comments/comment.service.ts
git commit -m "fix: 修复数据库事务超时问题

- 增加数据库事务超时时间至30秒
- 修复 .env.production 格式问题
- 优化评论服务事务处理"
git push

echo "✅ 本地更改已推送到远程仓库"

echo "🔧 请在服务器上执行以下命令："
echo "----------------------------------------"
echo "cd /www/wwwroot/council.zcanic.xyz"
echo "git pull origin main"
echo "cp .env.production.bak .env.production 2>/dev/null || true"
echo "cat > .env.production << 'EOF'"
cat .env.production
echo "EOF"
echo "npm run build"
echo "pm2 restart parliament-loop"
echo "pm2 logs parliament-loop --lines 10"
echo "----------------------------------------"

echo "🎯 修复完成后，第10个评论应该能正常触发AI总结了！"
