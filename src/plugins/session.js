
const session = require("koa-session");

/**
 * session服务 https://github.com/koajs/session
 */

module.exports = function (options, app) {

  app.keys = ['pomjs'];

  // add session support
  const sessionConfig = {
    key: 'pomjs', /** (string) cookie key (default is koa:sess) */
    maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
  };
  if (options.auth && options.auth.domain) {
    sessionConfig.domain = opts.auth.domain;
  }

  return session(sessionConfig, app);

}