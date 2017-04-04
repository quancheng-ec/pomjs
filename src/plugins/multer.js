
const koaMulter = require('koa-multer');

/**
 *  multer 中间件，处理上传文件
 */

module.exports = function (options, app) {

  return async function multer(ctx, next) {
    // parse only content-type starts with multipart
    if (ctx.request.header["content-type"] && ctx.request.header["content-type"].startsWith('multipart/')) {
      const uploader = koaMulter(opts);
      try {
        const mid = uploader.any();
        await mid(ctx, next);
      } catch (e) {
        ctx.throw(400, e.message);
      }
      return;
    }
    await next();
  }

}