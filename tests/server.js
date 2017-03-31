
const path = require('path')
const Koa = require('koa')
const serve = require('koa-static')
const config = require('./server.config')

let app = new Koa()

app.use(serve(path.resolve(__dirname, '..')))

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`)
})
