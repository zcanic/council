# 🚀 Parliament Loop 生产环境配置指南

## ⚠️ 部署前必须修改的配置项

### 1. 替换域名占位符
请将以下文件中的 `yourdomain.com` 替换为您的实际域名：

#### 📝 需要修改的文件列表
- `.env.production`
- `deploy.sh` 
- `nginx.conf`
- `ecosystem.config.js`

### 2. 具体修改内容

#### 🔸 .env.production 文件
```bash
# 第13行 - 替换为您的实际域名
NEXT_PUBLIC_API_URL="https://parliament.你的域名.com"

# 第6行 - 确认数据库配置（如需要）
DATABASE_URL="mysql://council_user:你的数据库密码@localhost:3306/parliament_loop"
```

#### 🔸 deploy.sh 文件  
```bash
# 第13行 - 替换域名
PROJECT_DIR="/www/wwwroot/parliament.你的域名.com"
```

#### 🔸 nginx.conf 文件
```nginx
# 第6行 - 服务器域名
server_name parliament.你的域名.com;

# 第11-12行 - SSL证书路径  
ssl_certificate /www/server/panel/vhost/cert/parliament.你的域名.com/fullchain.pem;
ssl_certificate_key /www/server/panel/vhost/cert/parliament.你的域名.com/privkey.pem;
```

#### 🔸 ecosystem.config.js 文件
```javascript
// 第6行 - 工作目录
cwd: '/www/wwwroot/parliament.你的域名.com',
```

## 🔧 可选修改项

### 数据库配置
如果您的数据库配置与默认不同，请修改：
```bash
# .env.production 中的数据库连接字符串
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名"
```

### 服务器端口
如果需要使用其他端口（默认3000）：
```bash
# .env.production
PORT=你的端口

# ecosystem.config.js  
PORT: 你的端口

# nginx.conf
proxy_pass http://127.0.0.1:你的端口;
```

### PM2实例数量
如果服务器配置较高，可以启用多实例：
```javascript
// ecosystem.config.js
instances: 'max',        // 使用所有CPU核心
exec_mode: 'cluster',    // 集群模式
```

## 🚀 部署步骤

1. **修改配置文件**（按照上述清单）
2. **上传到服务器**：将项目文件上传到宝塔面板网站目录
3. **运行部署脚本**：
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
4. **配置Nginx**：复制nginx.conf内容到宝塔面板网站配置
5. **启动应用**：通过宝塔面板PM2管理器启动应用

## ✅ 部署验证

部署完成后，请访问以下链接验证：
- `https://你的域名.com` - 主页
- `https://你的域名.com/api/health` - 健康检查
- 测试创建话题和评论功能

## 🆘 常见问题

1. **数据库连接失败**：检查MySQL服务和用户权限
2. **域名解析问题**：确保DNS解析正确指向服务器
3. **SSL证书错误**：通过宝塔面板申请并配置SSL证书
4. **端口冲突**：确保3000端口未被其他服务占用

---
**祝您部署顺利！🎉**
