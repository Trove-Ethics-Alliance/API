module.exports = {
  apps: [{
    name: 'Express Server',
    instances: 'max',
    script: 'node application.js',
    error_file: 'logs/error.log',
    out_file: 'logs/output.log'
  }]
};
