module.exports = {
  apps: [
    {
      name: 'xinwei-resource-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 1, // 或者使用 'max' 来利用所有 CPU 核心
      exec_mode: 'cluster', // 使用 cluster 模式
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true
    }
  ]
};