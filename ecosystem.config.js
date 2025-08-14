module.exports = {
  apps: [{
    name: 'parliament-loop',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/council.zcanic.xyz',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'mysql://council_user:parliament_pass_2024@localhost:3306/parliament_loop',
      NEXT_PUBLIC_API_URL: 'http://council.zcanic.xyz'
    },
    error_file: '/www/wwwlogs/council.zcanic.xyz/error.log',
    out_file: '/www/wwwlogs/council.zcanic.xyz/out.log',
    log_file: '/www/wwwlogs/council.zcanic.xyz/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
