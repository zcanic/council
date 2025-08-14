#!/bin/bash

# Parliament Loop 性能测试脚本
# 测试API响应时间和功能完整性

echo "🚀 Parliament Loop 性能测试开始..."

# 配置
SERVER_URL="https://council.zcanic.xyz"
LOCAL_URL="http://localhost:3000"

# 选择测试服务器
if [ "$1" = "local" ]; then
    BASE_URL=$LOCAL_URL
    echo "🏠 测试本地服务器: $BASE_URL"
else
    BASE_URL=$SERVER_URL
    echo "🌐 测试生产服务器: $BASE_URL"
fi

echo "⏱️  开始性能测试..."

# 测试健康检查接口
echo ""
echo "1️⃣ 测试健康检查接口:"
curl -w "响应时间: %{time_total}s, HTTP状态: %{http_code}\n" \
     -s -o /dev/null \
     "$BASE_URL/api/health"

# 测试获取议题列表
echo ""
echo "2️⃣ 测试获取议题列表:"
curl -w "响应时间: %{time_total}s, HTTP状态: %{http_code}\n" \
     -s -o /dev/null \
     "$BASE_URL/api/topics"

# 测试创建议题
echo ""
echo "3️⃣ 测试创建议题:"
TOPIC_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code};TIME:%{time_total}" \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"title":"性能测试议题-'$(date +%s)'"}' \
     "$BASE_URL/api/topics")

# 解析响应
TOPIC_DATA=$(echo "$TOPIC_RESPONSE" | sed '$d')
TOPIC_META=$(echo "$TOPIC_RESPONSE" | tail -n1)
HTTP_CODE=$(echo "$TOPIC_META" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
TIME_TAKEN=$(echo "$TOPIC_META" | grep -o 'TIME:[0-9.]*' | cut -d: -f2)

echo "响应时间: ${TIME_TAKEN}s, HTTP状态: $HTTP_CODE"

if [ "$HTTP_CODE" = "201" ]; then
    TOPIC_ID=$(echo "$TOPIC_DATA" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "✅ 创建成功，议题ID: $TOPIC_ID"
    
    # 测试获取议题详情
    echo ""
    echo "4️⃣ 测试获取议题详情:"
    curl -w "响应时间: %{time_total}s, HTTP状态: %{http_code}\n" \
         -s -o /dev/null \
         "$BASE_URL/api/topics/$TOPIC_ID"
    
    # 测试创建评论
    echo ""
    echo "5️⃣ 测试创建评论:"
    COMMENT_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code};TIME:%{time_total}" \
         -X POST \
         -H "Content-Type: application/json" \
         -d '{
           "content":"这是一条性能测试评论",
           "author":"测试用户",
           "parentId":"'$TOPIC_ID'",
           "parentType":"topic"
         }' \
         "$BASE_URL/api/comments")
    
    # 解析评论响应
    COMMENT_META=$(echo "$COMMENT_RESPONSE" | tail -n1)
    COMMENT_HTTP_CODE=$(echo "$COMMENT_META" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
    COMMENT_TIME=$(echo "$COMMENT_META" | grep -o 'TIME:[0-9.]*' | cut -d: -f2)
    
    echo "响应时间: ${COMMENT_TIME}s, HTTP状态: $COMMENT_HTTP_CODE"
    
    if [ "$COMMENT_HTTP_CODE" = "201" ]; then
        echo "✅ 评论创建成功"
    else
        echo "❌ 评论创建失败"
    fi
else
    echo "❌ 议题创建失败，跳过后续测试"
fi

# 并发测试
echo ""
echo "6️⃣ 并发性能测试 (5个并发请求):"
echo "测试并发获取议题列表..."

start_time=$(date +%s.%N)
for i in {1..5}; do
    curl -s -o /dev/null "$BASE_URL/api/topics" &
done
wait
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)

echo "5个并发请求完成时间: ${duration}s"
echo "平均每个请求: $(echo "scale=3; $duration / 5" | bc)s"

# 总结
echo ""
echo "📊 性能测试完成！"
echo ""
echo "🎯 性能标准参考:"
echo "- 健康检查: 应 < 0.1s"
echo "- 获取列表: 应 < 0.5s" 
echo "- 创建内容: 应 < 1s"
echo "- 评论提交: 应 < 2s (含业务逻辑)"
echo ""
echo "⚡ 如果发现性能问题:"
echo "1. 检查数据库连接和索引"
echo "2. 检查网络延迟"
echo "3. 检查服务器资源使用情况"
echo "4. 运行 ./diagnose.sh 进行详细诊断"
