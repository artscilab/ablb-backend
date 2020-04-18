module.exports = {
  apps : [{
    name: 'ablb_backend',
    script: 'yarn',
    args: 'start',
    instances: 1,
    watch: true,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};