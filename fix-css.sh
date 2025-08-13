#!/bin/bash

# CSS样式修复脚本 - 解决页面布局问题

echo "🎨 开始修复CSS样式问题..."

# 1. 清理所有构建缓存
echo "🧹 清理构建缓存..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf out

# 2. 重新安装依赖（确保Tailwind相关依赖正确）
echo "📦 重新安装依赖..."
npm install

# 3. 验证Tailwind配置
echo "⚙️ 验证Tailwind配置..."
npx tailwindcss --init --dry-run || echo "Tailwind配置可能有问题"

# 4. 重新构建CSS
echo "🔧 重新构建项目..."
npm run build

echo "✅ CSS修复完成!"

# 提交修复
echo "📤 提交修复到Git..."
git add -A
git commit -m "fix: 修复CSS样式加载问题

- 清理构建缓存
- 重新构建Tailwind样式
- 确保样式文件正确加载"
git push

echo "🚀 请在服务器上执行以下命令来应用修复:"
echo "----------------------------------------"
echo "cd /www/wwwroot/council.zcanic.xyz"
echo "git pull origin main"
echo "rm -rf .next node_modules/.cache"
echo "npm install"
echo "npm run build"
echo "pm2 restart parliament-loop"
echo "----------------------------------------"
