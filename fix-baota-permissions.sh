#!/bin/bash

# 解决宝塔面板权限问题的脚本

echo "🔧 解决宝塔面板文件权限问题..."

# 1. 移除 .user.ini 文件的不可变属性
echo "📝 处理 .user.ini 文件..."
if [ -f "/www/wwwroot/council.zcanic.xyz/.user.ini" ]; then
    chattr -i /www/wwwroot/council.zcanic.xyz/.user.ini
    echo "✅ 已移除 .user.ini 的不可变属性"
fi

# 2. 设置正确的文件所有权
echo "👤 设置文件所有权..."
chown -R www:www /www/wwwroot/council.zcanic.xyz
echo "✅ 文件所有权设置完成"

# 3. 设置正确的文件权限
echo "🔒 设置文件权限..."
find /www/wwwroot/council.zcanic.xyz -type f -exec chmod 644 {} \;
find /www/wwwroot/council.zcanic.xyz -type d -exec chmod 755 {} \;

# 4. 为脚本文件设置执行权限
echo "🚀 设置脚本执行权限..."
chmod +x /www/wwwroot/council.zcanic.xyz/deploy.sh
chmod +x /www/wwwroot/council.zcanic.xyz/deploy-docker.sh 2>/dev/null || true

# 5. 重新设置 .user.ini 的不可变属性（安全考虑）
echo "🔐 恢复 .user.ini 保护..."
if [ -f "/www/wwwroot/council.zcanic.xyz/.user.ini" ]; then
    chattr +i /www/wwwroot/council.zcanic.xyz/.user.ini
    echo "✅ 已恢复 .user.ini 的保护属性"
fi

echo "🎉 权限问题修复完成！"
echo "现在可以继续执行部署脚本了："
echo "cd /www/wwwroot/council.zcanic.xyz && ./deploy.sh"
