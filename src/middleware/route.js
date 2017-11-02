/**
 * 处理Route模块，并执行Control逻辑
 *
 * Created by joe on 16/9/23.
 */

const Path = require('path')
const fetch = require('node-fetch')

const pageLoader = require('../util/pageLoader')

const DEFAULT_NAME = 'index.js'
const DEFAULT_FILE = 'index/index.js'

const services = require('../grpc/index').services()

module.exports = (opts = {}) => {
  pageLoader.init(opts)
  const pageDir = opts.isProduction ? opts.page.build : opts.page.src

  return async function route (ctx, next) {
    let reqPath = ctx.path
    let ext = ''

    if (reqPath.indexOf('.') !== -1) {
      await next()
      return
    }

    let control
    let pageName = 'index'
    let pagePath
    let controlPath
    let action
    let type = 'render'

    if (reqPath === '/' || reqPath === '') {
      controlPath = Path.join(pageDir, 'index/index.js')
      pagePath = Path.join(pageDir, pageName)
      action = 'view'
      control = pageLoader.getAPI(controlPath, action)
    } else {
      if (reqPath.endsWith('/')) {
        // 去掉末尾的 ／
        reqPath = reqPath.substring(0, reqPath.length - 1)
      }

      // 请求路径 /api/xxxx,执行api操作
      // 如 /api/user/get 需要找到 pages/user/index.js.get()
      // /api/user pages/index.js.user()

      let parrs
      if (reqPath.startsWith('/api/')) {
        type = 'api'
        parrs = reqPath.substring(5).split('/')
      } else if (reqPath.startsWith('/event/')) {
        type = 'event'
        parrs = reqPath.substring(7).split('/')
      } else {
        parrs = reqPath.substring(1).split('/')
      }

      if (parrs.length === 1) {
        controlPath = Path.join(pageDir, DEFAULT_FILE)
        pagePath = Path.join(pageDir, pageName)
        action = parrs[0]
        control = pageLoader.getAPI(controlPath, action)
      } else if (parrs.length === 2) {
        controlPath = Path.join(pageDir, parrs[0], DEFAULT_NAME)
        pagePath = Path.join(pageDir, parrs[0])
        pageName = parrs[0]
        action = parrs[1]
        control = pageLoader.getAPI(controlPath, action)
        if (!control) {
          controlPath = Path.join(__dirname, '../pages', parrs[0], DEFAULT_NAME)
          control = pageLoader.getAPI(controlPath, action)
        }
      } else {
        let e = new Error('the path:' + ctx.path + ' not found!')
        e.statusCode = 404
        throw e
      }
    }

    if (!control) {
      await next()
      return
    }

    ctx.status = 200

    const context = Object.assign({}, ctx._httpContext)

    ctx.context = Object.assign({}, context, {
      context: context,
      pageContext: {
        pagePath: pagePath,
        pageName: pageName,
        pageAction: action
      },
      csrf: ctx.csrf,
      _token: ctx.response.header.token,
      _client: opts.clientData,
      _user: ctx.user
    })

    let controlResult = {
      isSuccess: true,
      errorCode: 0,
      errorMessage: '',
      data: {}
    }

    try {
      let proxyedServices = {}
      for (let key in services) {
        if (!services.hasOwnProperty(key)) continue

        proxyedServices[key] = new Proxy(services[key], {
          get: function (target, propKey, receiver) {
            const origMethod = target[propKey]
            if (typeof origMethod === 'function') {
              return async function (...args) {
                let timer = new ctx.logger.Timer({
                  group: 'service',
                  path: `${key}.${propKey}`
                })
                let result = await origMethod.apply(this, args)
                timer.split()
                return result
              }
            } else {
              return origMethod
            }
          }
        })
      }

      let timer = new ctx.logger.Timer({
        group: 'controller',
        path: `${pageName}:${action}`
      })

      controlResult.data = await control(ctx, proxyedServices)
      timer.split()
    } catch (e) {
      console.error(e)
      controlResult.isSuccess = false
      controlResult.errorCode = e.code
      controlResult.errorMessage = e.message
    }

    // if (typeof result !== 'object') {
    //     let e = new Error('the ' + api + ' result must be Object');
    //     e.statusCode = 500;
    //     throw e;
    // }

    if (type === 'event') {
      if (controlResult.data) {
        ctx.body = controlResult.data
      }
      return
    }

    if (type === 'api') {
      ctx.body = controlResult
      return
    }

    ctx.context = Object.assign(ctx.context, controlResult.data)

    await next()
  }
}
