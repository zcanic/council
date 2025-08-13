#!/bin/bash

# ===========================================
# Parliament Loop - Docker 生产部署脚本
# 域名: council.zcanic.xyz
# ===========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要命令
check_commands() {
    local commands=("docker" "docker-compose")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd 未安装，请先安装 Docker 和 Docker Compose"
            exit 1
        fi
    done
}

# 检查 Docker 服务状态
check_docker_service() {
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行，请启动 Docker 服务"
        exit 1
    fi
}

# 清理旧的容器和镜像
cleanup_old_deployment() {
    log_info "清理旧的容器和镜像..."
    
    # 停止并删除旧容器
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # 删除旧镜像（可选）
    if [ "$1" = "--clean" ]; then
        log_info "删除旧镜像..."
        docker image prune -f
        docker rmi council-app 2>/dev/null || true
    fi
}

# 构建和启动服务
deploy_services() {
    log_info "构建并启动所有服务..."
    
    # 构建应用镜像
    log_info "构建应用镜像..."
    docker-compose build app
    
    # 启动所有服务
    log_info "启动所有服务..."
    docker-compose up -d
    
    # 等待服务就绪
    log_info "等待服务启动..."
    sleep 10
    
    # 运行数据库迁移
    log_info "运行数据库迁移..."
    docker-compose exec -T app npx prisma db push --accept-data-loss
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000 &> /dev/null; then
            log_success "应用健康检查通过"
            return 0
        fi
        
        log_info "等待应用启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    log_error "应用健康检查失败"
    return 1
}

# 显示部署状态
show_deployment_status() {
    log_info "=== 部署状态 ==="
    docker-compose ps
    
    echo ""
    log_info "=== 服务访问地址 ==="
    echo "🌐 应用访问地址: http://localhost:3000"
    echo "🌐 生产域名: http://council.zcanic.xyz"
    echo "🔧 数据库地址: localhost:3306"
    echo "🤖 AI 服务: Moonshot AI (Kimi)"
    
    echo ""
    log_info "=== 有用的命令 ==="
    echo "查看日志: docker-compose logs -f"
    echo "查看应用日志: docker-compose logs -f app"
    echo "查看数据库日志: docker-compose logs -f db"
    echo "进入应用容器: docker-compose exec app sh"
    echo "进入数据库: docker-compose exec db mysql -u council_user -p parliament_loop"
    echo "停止服务: docker-compose down"
    echo "重启服务: docker-compose restart"
}

# 测试 AI 服务连接
test_ai_service() {
    log_info "测试 Moonshot AI 服务连接..."
    
    # 简单的连通性检查
    if curl -s --connect-timeout 5 https://api.moonshot.cn > /dev/null; then
        log_success "AI 服务连接正常"
    else
        log_warn "AI 服务连接可能存在问题，请检查网络连接"
    fi
}

# 主函数
main() {
    log_info "=== Parliament Loop Docker 部署开始 ==="
    
    # 检查环境
    check_commands
    check_docker_service
    
    # 清理旧部署
    cleanup_old_deployment $1
    
    # 部署服务
    deploy_services
    
    # 健康检查
    if health_check; then
        # 测试 AI 服务连接
        test_ai_service
        
        # 显示部署状态
        show_deployment_status
        
        log_success "=== 部署完成！ ==="
        log_info "应用已成功部署到 http://localhost:3000"
        log_info "请在 Nginx 中配置反向代理到 council.zcanic.xyz"
    else
        log_error "=== 部署失败！ ==="
        log_info "查看错误日志: docker-compose logs"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "Parliament Loop Docker 部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --clean    清理旧镜像（节省空间）"
    echo "  --help     显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                # 标准部署"
    echo "  $0 --clean        # 清理旧镜像后部署"
}

# 脚本入口
if [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# 执行主函数
main $1
