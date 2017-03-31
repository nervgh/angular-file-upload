
const Koa = require('koa')
const serve = require('koa-static')
const config = require('./server.config')

let app = new Koa()

app.use(serve(__dirname))

app.use(ctx => {
  ctx.body = `<title>Hello Koa</title>`
})

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`)
})
