/**
 * 缓存模块
 */

export default function (opts = {}) {

  return async function setCache(ctx, next) {
    ctx.cache = opts.cache
    await next()
  }
}