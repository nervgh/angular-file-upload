
const config = require('./server.config')

// conf.js
exports.config = {
  baseUrl: `http://localhost:${config.port}`,
  framework: 'jasmine',
  specs: [
    './e2e/*.js'
  ]
}