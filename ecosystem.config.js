module.exports = {
  apps: [{
    // Application name
    name: 'whatsway',
    
    // Application entry point
    script: './server/index.js',
    
    // Number of instances (1 for basic, 'max' for all CPU cores)
    instances: process.env.PM2_INSTANCES || 1,
    
    // Enable cluster mode for multiple instances
    exec_mode: process.env.PM2_INSTANCES > 1 ? 'cluster' : 'fork',
    
    // Auto-restart on crash
    autorestart: true,
    
    // Watch for file changes (disabled in production)
    watch: false,
    
    // Ignore watch for these paths
    ignore_watch: ['node_modules', 'logs', 'uploads', '.git'],
    
    // Max memory before restart
    max_memory_restart: process.env.PM2_MAX_MEMORY || '1G',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 5000
    },
    
    // Development environment
    env_development: {
      NODE_ENV: 'development',
      PORT: 5000,
      DEBUG: true
    },
    
    // Production environment
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 5000,
      DEBUG: false
    },
    
    // Log files
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Log date format
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Merge logs from all instances
    merge_logs: true,
    
    // Min uptime before considered successfully started
    min_uptime: '10s',
    
    // Max restarts within 1 minute before stopping
    max_restarts: 10,
    
    // Delay between restarts
    restart_delay: 4000,
    
    // Graceful shutdown timeout
    kill_timeout: 5000,
    
    // Node.js arguments
    node_args: '--max-old-space-size=2048',
    
    // Cron restart (optional - restart daily at 2 AM)
    // cron_restart: '0 2 * * *',
    
    // Post-deploy actions
    post_deploy: 'npm install --production && npm run build && pm2 reload ecosystem.config.js --env production',
    
    // Pre-deploy actions
    pre_deploy_local: 'echo "Deploying WhatsWay to production"'
  }],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/master',
      repo: 'git@github.com:your-repo/whatsway.git',
      path: '/var/www/whatsway',
      'post-deploy': 'npm install --production && npm run build && npm run db:push && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying WhatsWay to production server"'
    }
  }
};