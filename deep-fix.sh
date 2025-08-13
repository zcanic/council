#!/bin/bash

# 深度诊断和修复脚本 - 专门解决静态文件和构建问题

echo "🔍 开始深度诊断和修复..."

# 1. 检查当前环境
echo "=== 环境检查 ==="
echo "Node版本: $(node --version)"
echo "NPM版本: $(npm --version)" 
echo "当前目录: $(pwd)"

# 2. 检查配置文件冲突
echo "⚙️ 检查配置文件..."
if [ -f next.config.js ] && [ -f next.config.mjs ]; then
    echo "⚠️ 发现配置文件冲突，删除next.config.js"
    rm next.config.js
fi

# 3. 彻底清理
echo "🧹 彻底清理所有构建文件..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules
rm -rf out
rm -rf dist
rm -rf .swc

# 4. 重新安装依赖
echo "📦 重新安装依赖..."
npm cache clean --force
npm install

# 5. 检查环境变量
echo "⚙️ 检查环境变量..."
if [ -f .env.production ]; then
    echo "✅ .env.production 存在"
    grep -E "DATABASE_URL|OPENAI_API_KEY|AI_MODEL_NAME" .env.production | head -3
else
    echo "❌ .env.production 不存在"
fi

# 6. 验证Prisma
echo "🗄️ 验证数据库连接..."
npx prisma generate

# 7. 测试构建（详细输出）
echo "🔧 测试构建..."
NODE_ENV=production npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败，检查错误信息"
    exit 1
fi

# 8. 验证构建文件
echo "📁 验证构建文件..."
echo "静态文件目录:"
ls -la .next/static/ | head -10 || echo "静态文件目录不存在"
echo "服务器文件目录:"
ls -la .next/server/app/ | head -5 || echo "服务器文件不存在"

# 9. 检查文件权限
echo "🔐 检查文件权限..."
chmod -R 755 .next/static/ 2>/dev/null || true

echo "✅ 深度修复完成！"
