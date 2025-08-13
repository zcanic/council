#!/bin/bash

# 深度诊断和修复脚本

echo "🔍 开始深度诊断和修复..."

# 1. 检查当前环境
echo "=== 环境检查 ==="
echo "Node版本: $(node --version)"
echo "NPM版本: $(npm --version)"
echo "当前目录: $(pwd)"

# 2. 彻底清理
echo "🧹 彻底清理所有缓存..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules
rm -rf out
rm -rf dist

# 3. 重新安装依赖
echo "📦 重新安装依赖..."
npm cache clean --force
npm install

# 4. 检查环境变量
echo "⚙️ 检查环境变量..."
if [ -f .env.production ]; then
    echo "✅ .env.production 存在"
    grep -E "DATABASE_URL|OPENAI_API_KEY|AI_MODEL_NAME" .env.production | head -3
else
    echo "❌ .env.production 不存在"
fi

# 5. 验证Prisma
echo "🗄️ 验证数据库连接..."
npx prisma generate
npx prisma db push --skip-generate

# 6. 测试构建
echo "🔧 测试构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败，检查错误信息"
    exit 1
fi

# 7. 检查构建文件
echo "📁 检查构建文件..."
ls -la .next/static/css/ | head -5 || echo "CSS文件未找到"
ls -la .next/server/app/api/ | head -5 || echo "API路由未找到"

echo "✅ 诊断和修复完成！"
