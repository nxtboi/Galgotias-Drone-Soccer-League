// ==============================================================================
// GDSL 2026 Tournament Portal - PM2 Ecosystem Configuration
// Use this file to manage the app on a Linux VPS with PM2 process manager
// Command: pm2 start ecosystem.config.cjs --env production
// ==============================================================================

module.exports = {
  apps: [
    {
      name: 'gdsl-portal',
      script: 'server.ts',
      // In Node 22, tsx or node server.ts with type stripping can execute directly:
      interpreter: 'node',
      // If running with standard node on TypeScript server.ts, tsx handles it seamlessly:
      interpreter_args: '--import tsx',
      instances: 1, // Single instance authoritative for concurrent Excel writes
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      kill_timeout: 10000,
      listen_timeout: 8000,
    },
  ],
};
