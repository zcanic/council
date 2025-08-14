# 🔄 服务器更新指令

## 快速更新流程（推荐）

### 1. 连接到服务器
```bash
ssh root@council.zcanic.xyz
# 或使用宝塔面板的终端
```

### 2. 进入项目目录
```bash
cd /www/wwwroot/council.zcanic.xyz
```

### 3. 停止应用
```bash
pm2 stop parliament-loop
```

### 4. 拉取最新代码
```bash
git pull origin main
```

### 5. 安装依赖（如有package.json变化）
```bash
npm install
```

### 6. 构建项目
```bash
npm run build
```

### 7. 重启应用
```bash
pm2 start parliament-loop
```

### 8. 验证状态
```bash
pm2 status
pm2 logs parliament-loop --lines 20
```

---

## 一键更新脚本

创建更新脚本 `update.sh`：

```bash
#!/bin/bash

# 进入项目目录
cd /www/wwwroot/council.zcanic.xyz

echo "🔄 开始更新 Parliament Loop..."

# 停止应用
echo "📴 停止应用..."
pm2 stop parliament-loop

# 拉取最新代码
echo "⬇️  拉取最新代码..."
git pull origin main

# 检查是否有package.json变化
if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
    echo "📦 检测到依赖变化，重新安装..."
    npm install
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

# 重启应用
echo "🚀 重启应用..."
pm2 start parliament-loop

# 检查状态
echo "✅ 检查应用状态..."
pm2 status
pm2 logs parliament-loop --lines 10

echo "🎉 更新完成！"
echo "🌐 访问地址: https://council.zcanic.xyz"
```

### 使用一键脚本：
```bash
# 创建脚本
nano update.sh

# 给予执行权限
chmod +x update.sh

# 执行更新
./update.sh
```

---

## 详细更新步骤

### 预更新检查
```bash
# 检查当前版本
git log --oneline -5

# 检查应用状态
pm2 status

# 检查系统资源
free -h
df -h
```

### 数据库更新（如有schema变化）
```bash
# 运行Prisma迁移
npx prisma migrate deploy

# 更新Prisma客户端
npx prisma generate
```

### 环境变量检查
```bash
# 检查环境变量文件
ls -la .env*

# 比较环境变量模板（如果有新增）
diff .env .env.example
```

### 日志监控
```bash
# 实时查看日志
pm2 logs parliament-loop --lines 50 -f

# 查看错误日志
pm2 logs parliament-loop --err --lines 20

# 查看应用输出
pm2 logs parliament-loop --out --lines 20
```

---

## 回滚操作（如果更新失败）

### 快速回滚到上一版本
```bash
# 查看提交历史
git log --oneline -10

# 回滚到上一个提交
git reset --hard HEAD~1

# 重新构建和启动
npm run build
pm2 restart parliament-loop
```

### 从备份恢复
```bash
# 如果有备份目录
cp -r /backup/council.zcanic.xyz/* /www/wwwroot/council.zcanic.xyz/
pm2 restart parliament-loop
```

---

## 宝塔面板操作

### 通过宝塔面板更新：

1. **进入文件管理**
   - 导航到 `/www/wwwroot/council.zcanic.xyz`

2. **使用终端**
   - 点击"终端"按钮
   - 执行更新命令

3. **进程管理**
   - 进入"进程守护"
   - 找到 `parliament-loop` 进程
   - 重启进程

4. **查看日志**
   - 在进程管理中查看运行日志
   - 或直接查看 `logs/` 目录下的日志文件

---

## 故障排除

### 常见问题及解决方案：

#### 1. 构建失败
```bash
# 清理缓存重新构建
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### 2. PM2启动失败
```bash
# 删除并重新添加PM2配置
pm2 delete parliament-loop
pm2 start deployment/ecosystem.config.js
```

#### 3. 数据库连接问题
```bash
# 检查数据库连接
npx prisma db push
npx prisma studio
```

#### 4. 端口占用
```bash
# 检查端口占用
netstat -tulpn | grep 3000
# 如有占用，结束进程
kill -9 <PID>
```

---

## 更新后验证清单

- [ ] 应用正常启动 (`pm2 status`)
- [ ] 网站可以正常访问 (https://council.zcanic.xyz)
- [ ] 数据库连接正常
- [ ] 主要功能正常（创建话题、评论等）
- [ ] 日志无错误 (`pm2 logs parliament-loop`)
- [ ] 性能正常（响应时间、内存使用）

---

## 联系信息

如遇到问题，请检查：
1. PM2日志: `pm2 logs parliament-loop`
2. 应用日志: `logs/` 目录
3. Nginx日志: `/var/log/nginx/`
4. 宝塔面板错误日志

🚀 祝更新顺利！
