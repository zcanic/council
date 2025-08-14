#!/bin/bash

# 服务器环境变量修复脚本
# 用于解决Prisma DATABASE_URL环境变量问题

echo "🔧 开始修复环境变量问题..."

# 1. 创建.env文件
echo "📝 创建.env文件..."
cp .env.production .env

# 2. 导出环境变量
echo "📤 导出环境变量..."
export DATABASE_URL="mysql://council_user:parliament_pass_2024@localhost:3306/parliament_loop"
export NODE_ENV="production"
export OPENAI_API_KEY="sk-aC6UVaONEdVIw0lEf1RUmZtw8CuHHkZRm1v2e3XJ3oADIgad"
export OPENAI_BASE_URL="https://api.moonshot.cn/v1"
export AI_MODEL_NAME="kimi-k2-0711-preview"

# 3. 验证环境变量
echo "✅ 验证环境变量:"
echo "DATABASE_URL: $DATABASE_URL"
echo "NODE_ENV: $NODE_ENV"
echo "AI_MODEL_NAME: $AI_MODEL_NAME"

# 4. 生成Prisma客户端
echo "🔄 生成Prisma客户端..."
npx prisma generate

# 5. 构建应用
echo "🔧 构建应用..."
rm -rf .next
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    
    # 6. 重启PM2
    echo "🚀 重启PM2应用..."
    pm2 restart parliament-loop
    
    echo "📊 检查PM2状态..."
    pm2 status
    
    echo "✅ 环境变量修复完成！"
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi
