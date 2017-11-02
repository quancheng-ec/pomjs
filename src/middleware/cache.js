/**
 * 缓存模块
 */

module.exports = (opts = {}) => {
  return async function setCache (ctx, next) {
    ctx.cache = opts.cache
    await next()
  }
}
