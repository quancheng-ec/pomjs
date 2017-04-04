
const CSRF = require('koa-csrf');

/**
 * csrf  https://github.com/koajs/csrf
 */

module.exports = function (options) {

  return new CSRF.default(Object.assign({
    invalidSessionSecretMessage: 'Invalid session secret',
    invalidSessionSecretStatusCode: 403,
    invalidTokenMessage: 'Invalid CSRF token',
    invalidTokenStatusCode: 403,
    excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
    disableQuery: false
  }, options.csrf||{}));;

}