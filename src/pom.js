import { EventEmitter } from 'events'
import { createServer } from 'http'
import Koa from 'koa'

import cors from '@koa/cors'
import session from 'koa-session'
import CSRF from 'koa-csrf'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'

import loadOptions from './util/middlewareOptions'
import getConf from './util/getConf'

import incoming from './middleware/incoming'

class Pom extends EventEmitter {
  constructor (conf) {
    super()
    this.conf = getConf(conf)
    this.app = this.init(this.conf)
  }

  init (conf) {
    const app = new Koa()

    app.keys = ['pomjs']
    const getOptions = loadOptions(conf)

    app.use(cors(getOptions('cors')))
    app.use(session(getOptions('session'), app))
    app.use(bodyParser(getOptions('bodyParser')))
    app.use(new CSRF(getOptions('csrf')))
    app.use(serve(conf.staticPath, getOptions('serve')))
    app.use(incoming(conf))

    this.on('error', this.errorHandler)

    return app
  }

  errorHandler (err) {
    console.error(err)
  }

  start () {
    createServer(this.app.callback()).listen(this.conf.port)
  }
}

export default Pom
