/**
 *
 * saluki api 查看
 *
 * Created by joe on 16/12/26.
 */
const services = require('../grpc/index').services()
const consul = require('../grpc/consul')
module.exports = (opts = {}) => {
  return async function saluki (ctx, next) {
    let url = ctx.url
    ctx.services = services
    if (url.endsWith('/saluki')) {
      ctx.body = JSON.stringify(consul.getALL())
      return
    }
    await next()
  }
}
