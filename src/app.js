const Path = require('path')
const EventEmitter = require('events')
const { createServer } = require('http')

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')
const session = require('koa-session')
const CSRF = require('koa-csrf').default
const serve = require('koa-static')

const mergeConfig = require('./util/mergeConfig')

const httpWrap = require('./middleware/http')
const route = require('./middleware/route')
const render = require('./middleware/render')
const error = require('./middleware/error')
const bundle = require('./middleware/bundle')
const multer = require('./middleware/multer')
const user = require('./middleware/user')
const saluki = require('./middleware/saluki')
const log = require('./middleware/logger')
const healthCheck = require('./middleware/healthCheck')
const spartaSession = require('./middleware/spartaSession')
const grpcClient = require('./grpc')
class App extends EventEmitter {
  constructor(config) {
    super()
    this.app = this.initApp(config)
    this.config = this.app.config
    this.server = createServer(this.app.callback())
  }

  async initGrpc(config) {
    grpcClient.grpcOptions = Object.assign(
      grpcClient.grpcOptions,
      config.saluki.grpcOptions
    )
    await grpcClient.init(config)
  }

  initApp(config) {
    config = mergeConfig(config)

    const app = new Koa()

    this.initGrpc(config)

    app.keys = ['quancheng-ec', 'pomjs']
    app.config = config
    app.context.config = config

    app.use(log(config))
    app.use(serve(config.static, { maxage: 60 * 60 * 24 * 365 }))

    const sessionConfig = {
      key: 'pomjs:sess',
      maxAge: 60 * 60 * 24,
      overwrite: true,
      httpOnly: true,
      signed: true
    }

    app.use(session(sessionConfig, app))

    if (config.cors) {
      app.use(cors(config.cors))
    }

    app.use(multer(config.uploadConfig || {}))

    app.use(
      bodyParser({
        jsonLimit: '10mb',
        textLimit: '10mb'
      })
    )

    const csrfMid = new CSRF(
      Object.assign(
        {
          invalidSessionSecretMessage: 'Invalid session secret',
          invalidSessionSecretStatusCode: 403,
          invalidTokenMessage: 'Invalid CSRF token',
          invalidTokenStatusCode: 403,
          excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
          disableQuery: false
        },
        config.csrf
      )
    )

    app.use(csrfMid)

    app.use(error(config))
    app.use(saluki(config))
    app.use(httpWrap(config))
    app.use(bundle(config))
    app.use(healthCheck(config))

    if (config.sparta) {
      app.use(spartaSession(config))
    }

    app.use(route(config))
    app.use(render(config))

    return app
  }

  startServer() {
    const serverPort = this.config.port ? Number(this.config.port) : 8080
    this.server.listen(serverPort)
    console.log(`server is running on port: ${serverPort}`)
  }
}

process.on('uncaughtException', err => {
  console.dir(err)
})

process.on('exit', info => {
  console.dir(info)
})

process.on('unhandledRejection', (reason, p) => {
  console.error(
    `Possibly Unhandled Rejection at: Promise ${p}. reason: ${reason}`
  )
})

module.exports = exports = config => {
  const app = new App(config)
  return app
}
