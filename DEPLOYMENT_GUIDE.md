# Parliament Loop - 宝塔面板部署指南

## 🚀 部署概览

Parliament Loop是基于Next.js的全栈应用，需要Node.js环境和MySQL数据库支持。

## 📋 服务器要求

### 最低配置
- **CPU**: 1核心
- **内存**: 2GB RAM
- **存储**: 20GB SSD
- **带宽**: 1Mbps

### 推荐配置  
- **CPU**: 2核心以上
- **内存**: 4GB RAM以上
- **存储**: 40GB SSD以上
- **带宽**: 5Mbps以上

### 系统要求
- **操作系统**: CentOS 7+, Ubuntu 18+, Debian 9+
- **宝塔面板**: 7.0+版本
- **Node.js**: 18+
- **MySQL**: 8.0+
- **Nginx**: 反向代理配置

## 🔧 宝塔面板准备工作

### 1. 安装必要软件
在宝塔面板的"软件商店"中安装：
- **Node.js版本管理器** (推荐安装18.x版本)
- **MySQL** (8.0版本)
- **Nginx** (用于反向代理)
- **PM2管理器** (进程管理)

### 2. 创建数据库
1. 进入MySQL管理
2. 创建新数据库：`parliament_loop`
3. 创建数据库用户：`council_user`
4. 设置密码并授权

### 3. 配置域名
1. 在"网站"中添加站点
2. 绑定域名（如：parliament.yourdomain.com）
3. 申请SSL证书（推荐Let's Encrypt免费证书）

## � 快速部署步骤

### 一键部署脚本
```bash
# 1. SSH连接到服务器
ssh root@your-server-ip

# 2. 进入网站目录
cd /www/wwwroot/parliament.yourdomain.com

# 3. 克隆项目
git clone https://github.com/zcanic/council.git .

# 4. 给部署脚本执行权限
chmod +x deploy.sh

# 5. 运行自动部署
./deploy.sh
```

### 手动部署步骤

### Step 1: 上传项目代码

#### 方法1：Git拉取（推荐）
```bash
# SSH连接服务器后执行
cd /www/wwwroot/parliament.yourdomain.com
git clone https://github.com/zcanic/council.git .
```

#### 方法2：文件上传
- 将项目打包上传到网站根目录
- 解压到 `/www/wwwroot/parliament.yourdomain.com/`

### Step 2: 安装项目依赖
```bash
# 在网站根目录执行
npm install --production
```

### Step 3: 配置环境变量
创建 `.env.production` 文件：
```env
# 数据库配置
DATABASE_URL="mysql://council_user:your_password@localhost:3306/parliament_loop"

# 生产环境配置
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://parliament.yourdomain.com"

# AI服务配置（如果有）
OPENAI_API_KEY="your-api-key"
OPENAI_BASE_URL="https://api.openai.com/v1"
AI_MODEL_NAME="gpt-3.5-turbo"

# 其他配置
PORT=3000
```

### Step 4: 数据库初始化
```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库结构
npx prisma db push

# 可选：填充示例数据
npx prisma db seed
```

### Step 5: 构建生产版本
```bash
# 构建Next.js应用
npm run build
```

## 🔄 Nginx反向代理配置

### 1. 修改网站配置
在宝塔面板的"网站设置" → "配置文件"中添加：

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name parliament.yourdomain.com;
    
    # SSL证书配置
    ssl_certificate /www/server/panel/vhost/cert/parliament.yourdomain.com/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/parliament.yourdomain.com/privkey.pem;
    
    # 反向代理到Next.js应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://127.0.0.1:3000;
    }
    
    # HTTP重定向到HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
}
```

## 🎯 PM2进程管理

### 1. 创建PM2配置文件
创建 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: 'parliament-loop',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/parliament.yourdomain.com',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/www/wwwroot/parliament.yourdomain.com/logs/err.log',
    out_file: '/www/wwwroot/parliament.yourdomain.com/logs/out.log',
    log_file: '/www/wwwroot/parliament.yourdomain.com/logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

### 2. 启动应用
```bash
# 创建日志目录
mkdir -p logs

# 启动PM2进程
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

## 🔍 监控和维护

### 1. PM2常用命令
```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs parliament-loop

# 重启应用
pm2 restart parliament-loop

# 停止应用
pm2 stop parliament-loop

# 监控资源使用
pm2 monit
```

### 2. 数据库维护
```bash
# 备份数据库
mysqldump -u council_user -p parliament_loop > backup_$(date +%Y%m%d).sql

# 还原数据库
mysql -u council_user -p parliament_loop < backup_20250812.sql
```

## 🚨 故障排查

### 常见问题解决

#### 1. 应用无法启动
- 检查Node.js版本：`node --version`
- 检查依赖安装：`npm ls`
- 查看错误日志：`pm2 logs`

#### 2. 数据库连接失败
- 验证数据库连接：`npx prisma db pull`
- 检查环境变量配置
- 确认MySQL服务状态

#### 3. 静态资源加载失败
- 检查Nginx配置
- 验证构建输出：`ls .next/static`
- 清除浏览器缓存

#### 4. 性能优化
- 启用Nginx gzip压缩
- 配置CDN加速静态资源
- 调整PM2集群模式

## 📊 性能监控

### 宝塔面板监控
- CPU和内存使用率
- 磁盘空间监控
- 网络流量统计
- MySQL性能监控

### 应用监控
```bash
# 安装监控工具
npm install --save @sentry/nextjs

# PM2监控
pm2 install pm2-server-monit
```

## 🔄 自动部署脚本

创建 `deploy.sh`：
```bash
#!/bin/bash
echo "🚀 开始部署Parliament Loop..."

# 拉取最新代码
git pull origin main

# 安装依赖
npm ci --production

# 构建应用
npm run build

# 重启服务
pm2 restart parliament-loop

echo "✅ 部署完成！"
```

## 📋 部署检查清单

- [ ] 服务器环境准备完成
- [ ] 域名DNS解析配置
- [ ] SSL证书安装成功
- [ ] 数据库创建并初始化
- [ ] 环境变量配置正确
- [ ] Nginx反向代理配置
- [ ] PM2进程启动正常
- [ ] 防火墙端口开放（3000, 80, 443）
- [ ] 备份恢复策略制定

---

**部署完成后，访问您的域名即可体验Parliament Loop！** 🏛️✨
