
const cors = require("koa-cors");

/**
 *  cors中间件
 */

module.exports = function (options, app) {

  //如果配置了cors（解决跨域问题）, 则加入中间件
  if (options.cors) {
    return cors(options.cors);
  }
  return null;

}