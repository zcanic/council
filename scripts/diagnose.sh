#!/bin/bash

# Parliament Loop 服务器性能诊断脚本
# 使用方法: ./diagnose.sh

echo "🔍 Parliament Loop 服务器诊断开始..."

# 基础信息
echo ""
echo "📋 基础信息检查:"
echo "当前时间: $(date)"
echo "服务器: $(hostname)"
echo "用户: $(whoami)"

# 检查应用状态
echo ""
echo "🚀 应用状态检查:"
if command -v pm2 >/dev/null 2>&1; then
    echo "PM2 进程状态:"
    pm2 status
    echo ""
    echo "Parliament Loop 日志 (最近20行):"
    pm2 logs parliament-loop --lines 20 --nostream
else
    echo "⚠️  PM2 未安装或未在PATH中"
fi

# 检查端口占用
echo ""
echo "🔌 端口状态检查:"
echo "端口 3000 状态:"
lsof -i :3000 || echo "端口 3000 未被占用"
echo "端口 3306 状态 (MySQL):"
lsof -i :3306 || echo "端口 3306 未被占用"

# 检查数据库连接
echo ""
echo "🗄️  数据库连接检查:"
if command -v mysql >/dev/null 2>&1; then
    echo "尝试连接数据库..."
    timeout 5 mysql -h localhost -u council_user -pparliament_pass_2024 -e "SELECT 1;" parliament_loop 2>/dev/null \
        && echo "✅ 数据库连接正常" \
        || echo "❌ 数据库连接失败"
else
    echo "⚠️  MySQL客户端未安装，无法测试数据库连接"
fi

# 检查网络连接
echo ""
echo "🌐 网络连接检查:"
echo "检查本地服务器响应:"
curl -s -w "HTTP状态: %{http_code}, 响应时间: %{time_total}s\n" -o /dev/null http://localhost:3000/api/health \
    || echo "❌ 无法连接到本地服务器"

echo "检查外部访问:"
curl -s -w "HTTP状态: %{http_code}, 响应时间: %{time_total}s\n" -o /dev/null https://council.zcanic.xyz/api/health \
    || echo "❌ 无法通过外部地址访问"

# 检查AI服务连接
echo ""
echo "🤖 AI服务连接检查:"
if [ -f .env.production ]; then
    API_KEY=$(grep OPENAI_API_KEY .env.production | cut -d'=' -f2 | tr -d '"')
    BASE_URL=$(grep OPENAI_BASE_URL .env.production | cut -d'=' -f2 | tr -d '"')
    
    if [ ! -z "$API_KEY" ] && [ ! -z "$BASE_URL" ]; then
        echo "测试 AI API 连接..."
        curl -s -w "HTTP状态: %{http_code}, 响应时间: %{time_total}s\n" \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            -o /dev/null \
            "${BASE_URL}/models" \
            || echo "❌ AI服务连接失败"
    else
        echo "⚠️  AI API配置不完整"
    fi
else
    echo "⚠️  .env.production 文件未找到"
fi

# 系统资源检查
echo ""
echo "💻 系统资源检查:"
echo "内存使用:"
free -h
echo ""
echo "磁盘使用:"
df -h /
echo ""
echo "CPU负载:"
uptime

# 检查日志大小
echo ""
echo "📝 日志文件检查:"
if [ -d "logs" ]; then
    echo "应用日志目录大小:"
    du -sh logs/
    echo "最新日志文件:"
    ls -lht logs/ | head -5
else
    echo "logs 目录不存在"
fi

# 检查Node.js进程
echo ""
echo "⚡ Node.js 进程检查:"
ps aux | grep -i node | grep -v grep || echo "未找到 Node.js 进程"

echo ""
echo "🎯 诊断完成！"
echo ""
echo "📋 常见问题解决方案:"
echo "1. 如果数据库连接失败，请检查 MySQL 服务是否运行"
echo "2. 如果端口被占用，使用 'sudo kill -9 <PID>' 结束进程"
echo "3. 如果PM2进程异常，使用 'pm2 restart parliament-loop'"
echo "4. 如果AI服务失败，检查API密钥和网络连接"
echo "5. 如果内存不足，考虑重启服务器或增加内存"
