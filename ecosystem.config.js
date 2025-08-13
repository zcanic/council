module.exports = {
  apps: [{
    // 应用基础配置
    name: 'parliament-loop',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/council.zcanic.xyz',
    
    // 进程配置
    instances: 1,                    // 单实例模式，如果服务器配置高可以设置为 'max'
    exec_mode: 'fork',               // fork模式，集群模式用 'cluster'
    
    // 环境变量
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // 日志配置
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,                      // 日志时间戳
    
    // 自动重启配置
    autorestart: true,
    watch: false,                    // 生产环境不开启文件监听
    max_memory_restart: '1G',        // 内存超过1G自动重启
    max_restarts: 10,                // 最大重启次数
    min_uptime: '10s',               // 最小运行时间
    
    // 健康检查
    health_check_grace_period: 3000, // 健康检查宽限期
    
    // 进程管理
    kill_timeout: 5000,              // 强制杀死进程的超时时间
    listen_timeout: 3000,            // 监听超时时间
    
    // 环境特定配置
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'mysql://council_user:parliament_pass_2024@localhost:3306/parliament_loop',
      NEXT_PUBLIC_API_URL: 'http://council.zcanic.xyz',
      OPENAI_API_KEY: 'sk-aC6UVaONEdVIw0lEf1RUmZtw8CuHHkZRm1v2e3XJ3oADIgad',
      OPENAI_BASE_URL: 'https://api.moonshot.cn/v1',
      AI_MODEL_NAME: 'kimi-k2-0711-preview'
    },
    
    // 开发环境配置（备用）
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000,
    }
  }],
  
  // 部署配置（可选）
  deploy: {
    production: {
      user: 'root',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/zcanic/council.git',
      path: '/www/wwwroot/parliament.yourdomain.com',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};
