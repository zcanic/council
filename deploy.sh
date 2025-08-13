#!/bin/bash

# Parliament Loop 宝塔面板自动部署脚本
# 使用方法：chmod +x deploy.sh && ./deploy.sh

set -e

echo "🏛️ Parliament Loop 自动部署开始..."
echo "================================================"

# 配置变量
PROJECT_NAME="parliament-loop"
PROJECT_DIR="/www/wwwroot/council.zcanic.xyz"
NODE_VERSION="18"
DB_NAME="parliament_loop"
PM2_APP_NAME="parliament-loop"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    log_error "未找到 package.json 文件，请确保在项目根目录执行此脚本"
    exit 1
fi

# 1. 检查Node.js版本
log_info "检查Node.js版本..."
NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
    log_error "Node.js版本过低，需要v${NODE_VERSION}+，当前版本：$(node -v)"
    log_info "请在宝塔面板中安装Node.js ${NODE_VERSION}.x版本"
    exit 1
fi
log_info "Node.js版本检查通过：$(node -v)"

# 2. 备份当前版本
log_info "创建备份..."
if [ -d ".next" ]; then
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p backups/$BACKUP_DIR
    cp -r .next backups/$BACKUP_DIR/
    log_info "备份已创建：backups/$BACKUP_DIR"
fi

# 3. 拉取最新代码
log_info "拉取最新代码..."
git pull origin main
if [ $? -ne 0 ]; then
    log_error "代码拉取失败，请检查Git配置"
    exit 1
fi

# 4. 检查环境变量
log_info "检查环境变量..."
if [ ! -f ".env.production" ] && [ ! -f ".env.local" ]; then
    log_warn "未找到环境配置文件，创建模板..."
    cat > .env.production << EOF
# 数据库配置
DATABASE_URL="mysql://council_user:your_password@localhost:3306/${DB_NAME}"

# 生产环境配置
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://parliament.yourdomain.com"

OPENAI_API_KEY="sk-aC6UVaONEdVIw0lEf1RUmZtw8CuHHkZRm1v2e3XJ3oADIgad"
OPENAI_BASE_URL="https://api.moonshot.cn/v1"
AI_MODEL_NAME="kimi-k2-0711-preview"

# 其他配置
PORT=3000
EOF
    log_warn "请编辑 .env.production 文件并填入正确的配置信息"
fi

# 5. 安装依赖
log_info "安装项目依赖..."
npm ci --production --silent
if [ $? -ne 0 ]; then
    log_error "依赖安装失败"
    exit 1
fi

# 6. 数据库操作
log_info "处理数据库..."
npx prisma generate --silent
npx prisma db push --accept-data-loss
if [ $? -ne 0 ]; then
    log_warn "数据库推送可能存在问题，请手动检查"
fi

# 7. 构建应用
log_info "构建生产版本..."
npm run build
if [ $? -ne 0 ]; then
    log_error "构建失败，请检查代码错误"
    exit 1
fi

# 8. 创建PM2配置（如果不存在）
if [ ! -f "ecosystem.config.js" ]; then
    log_info "创建PM2配置文件..."
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${PM2_APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${PROJECT_DIR}',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF
fi

# 9. 创建日志目录
mkdir -p logs

# 10. PM2进程管理
log_info "管理PM2进程..."
if pm2 list | grep -q "${PM2_APP_NAME}"; then
    log_info "重启现有PM2进程..."
    pm2 restart ${PM2_APP_NAME}
else
    log_info "启动新的PM2进程..."
    pm2 start ecosystem.config.js
    pm2 save
fi

# 11. 健康检查
log_info "执行健康检查..."
sleep 5
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    log_info "健康检查通过"
else
    log_warn "健康检查失败，请检查应用状态"
fi

# 12. 显示状态
log_info "显示应用状态..."
pm2 status ${PM2_APP_NAME}

echo "================================================"
log_info "🎉 Parliament Loop 部署完成！"
log_info "访问地址：https://parliament.yourdomain.com"
log_info "管理命令："
echo "  - 查看日志：pm2 logs ${PM2_APP_NAME}"
echo "  - 重启服务：pm2 restart ${PM2_APP_NAME}"
echo "  - 停止服务：pm2 stop ${PM2_APP_NAME}"
echo "  - 查看状态：pm2 status"
echo "================================================"
