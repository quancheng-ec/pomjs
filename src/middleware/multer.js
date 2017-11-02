/**
 * FormData 解析中间件
 * dependencies: koa-multer
 *
 * by Zephyr
 * 2016.11.27 21:40
 */
const koaMulter = require('koa-multer')

module.exports = (opts = {}) => {
  return async function multer (ctx, next) {
    // parse only content-type starts with multipart
    if (
      ctx.request.header['content-type'] &&
      ctx.request.header['content-type'].startsWith('multipart/')
    ) {
      const uploader = koaMulter(opts)
      try {
        const mid = uploader.any()
        await mid(ctx, next)
      } catch (e) {
        ctx.throw(400, e.message)
      }
      return
    }
    await next()
  }
}
