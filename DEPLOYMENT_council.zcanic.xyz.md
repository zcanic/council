# 🚀 Parliament Loop 部署指南 - council.zcanic.xyz

## 📋 配置概览
- **域名**: council.zcanic.xyz
- **协议**: HTTP (暂无SSL证书)
- **端口**: 3000
- **数据库**: MySQL 8.0
- **AI 服务**: Moonshot AI (Kimi)

## 🤖 AI 服务配置

本部署使用 **Moonshot AI (Kimi)** 作为 AI 服务提供商：

```bash
# AI 服务配置信息
API Base URL: https://api.moonshot.cn/v1
API Key: sk-aC6UVaONEdVIw0lEf1RUmZtw8CuHHkZRm1v2e3XJ3oADIgad
Model: kimi-k2-0711-preview
```

**优势：**
- ✅ 完全兼容 OpenAI 接口
- ✅ 中文理解能力强
- ✅ 响应速度快
- ✅ 减少服务器资源占用
- ✅ 云服务稳定可靠

## 🔧 已完成的配置修改

### ✅ 配置文件状态
- `.env.production` ✅ 域名已更新为 council.zcanic.xyz
- `deploy.sh` ✅ 项目路径已更新
- `nginx.conf` ✅ 移除SSL配置，使用HTTP协议
- `ecosystem.config.js` ✅ 工作目录已更新

## 🚀 部署步骤

### 1. 服务器环境准备
```bash
# 确保已安装必要软件：
# - Node.js 18+
# - MySQL 8.0
# - PM2
# - Nginx
```

### 2. 域名解析配置
确保 `council.zcanic.xyz` 已正确解析到您的服务器IP地址。

### 3. 宝塔面板网站创建
1. 登录宝塔面板
2. 创建新网站：`council.zcanic.xyz`
3. 选择PHP版本：纯静态或任意版本
4. 不勾选SSL（暂时）

### 4. 部署项目
```bash
# SSH连接到服务器
ssh root@your-server-ip

# 进入网站目录
cd /www/wwwroot/council.zcanic.xyz

# 克隆项目
git clone https://github.com/zcanic/council.git .

# 运行自动部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 5. Nginx配置
1. 在宝塔面板找到 `council.zcanic.xyz` 网站
2. 点击"设置" → "配置文件"
3. 替换为项目中的 `nginx.conf` 内容
4. 保存并重载Nginx

### 6. 数据库配置
```bash
# 创建数据库用户和数据库
mysql -u root -p

CREATE DATABASE parliament_loop;
CREATE USER 'council_user'@'localhost' IDENTIFIED BY 'parliament_pass_2024';
GRANT ALL PRIVILEGES ON parliament_loop.* TO 'council_user'@'localhost';
FLUSH PRIVILEGES;
```

### 7. PM2应用管理
```bash
# 使用PM2启动应用
pm2 start ecosystem.config.js

# 查看应用状态
pm2 status

# 查看日志
pm2 logs parliament-loop
```

## ✅ 部署验证

### 基础功能测试
1. **访问主页**: http://council.zcanic.xyz
2. **API健康检查**: http://council.zcanic.xyz/api/health
3. **创建话题测试**：尝试创建一个新话题
4. **评论功能测试**：在话题中添加评论

### 期望响应
```json
# 健康检查应返回：
{
  "status": "healthy",
  "timestamp": "2025-08-13T...",
  "database": "connected",
  "message": "Parliament Loop backend is running successfully"
}
```

## 🔒 SSL证书配置（可选）

如果需要HTTPS，可以通过宝塔面板申请免费SSL证书：

1. 宝塔面板 → 网站 → council.zcanic.xyz → SSL
2. 选择"Let's Encrypt"免费证书
3. 申请成功后，修改 `.env.production` 中的协议：
   ```bash
   NEXT_PUBLIC_API_URL="https://council.zcanic.xyz"
   ```
4. 重启PM2应用：`pm2 restart parliament-loop`

## 🆘 故障排除

### 常见问题

1. **页面无法访问**
   - 检查域名解析：`ping council.zcanic.xyz`
   - 检查Nginx状态：`systemctl status nginx`
   - 检查端口占用：`netstat -tulpn | grep :3000`

2. **API错误**
   - 检查PM2状态：`pm2 status`
   - 查看应用日志：`pm2 logs parliament-loop`
   - 检查数据库连接：`pm2 restart parliament-loop`

3. **数据库连接失败**
   - 确认MySQL服务运行：`systemctl status mysql`
   - 检查用户权限和密码
   - 确认数据库名称正确

### 日志文件位置
- **PM2日志**: `/www/wwwroot/council.zcanic.xyz/logs/`
- **Nginx日志**: `/www/wwwlogs/council.zcanic.xyz.log`
- **Nginx错误日志**: `/www/wwwlogs/council.zcanic.xyz.error.log`

## 📊 监控和维护

### PM2监控
```bash
# 实时监控
pm2 monit

# 重启应用
pm2 restart parliament-loop

# 停止应用
pm2 stop parliament-loop

# 删除应用
pm2 delete parliament-loop
```

### 数据库备份
建议设置定期数据库备份：
```bash
# 备份命令示例
mysqldump -u council_user -p parliament_loop > backup_$(date +%Y%m%d_%H%M%S).sql
```

---
**部署完成后，您的议会回环系统将在 http://council.zcanic.xyz 运行！** 🎉
