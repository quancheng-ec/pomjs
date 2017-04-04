
const path = require('path')
const staticCache = require('koa-static-cache')

/**
 * 静态资源
 *  Created by joe on 16/4/4.
 */

module.exports = function (options) {

  let static = options.static || path.join(process.cwd(), 'static');

  const cache = staticCache(static, {
    maxAge: 365 * 24 * 60 * 60
  });

  return cache;

}