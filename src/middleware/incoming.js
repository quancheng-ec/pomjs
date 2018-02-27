import fetch from 'node-fetch'

export default function (config) {
  return async function handleIncomming (ctx, next) {
    if (ctx.path === '/favicon.ico') return

    ctx.config = config
    const context = {
      url: ctx.url,
      href: ctx.href,
      method: ctx.method,
      host: ctx.host,
      path: ctx.path,
      param: Object.assign({}, ctx.request.query, ctx.request.body)
    }

    ctx._httpContext = context
    ctx.fetch = fetch

    await next()
  }
}
