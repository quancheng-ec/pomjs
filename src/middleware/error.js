const fs = require('fs-extra')
const { resolve } = require('path')
module.exports = function(opts = {}) {
  return async function error(ctx, next) {
    try {
      await next()
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500
      ctx.type = 'html'
      ctx.body = await fs.readFile(
        resolve(__dirname, '../../views/error.html'),
        'utf8'
      )
      if (ctx.status !== 404) {
        console.error(err)
      }
    }
  }
}
