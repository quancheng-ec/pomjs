/**
 *
 * 请求封装
 *
 * Created by joe on 16/9/23.
 */



module.exports = function (opts = {}) {


    return async function http(ctx, next) {

        ctx.opts = opts;

        const context = {
            url: ctx.url,
            href: ctx.href,
            method: ctx.method,
            host: ctx.host,
            path: ctx.path,
            param: Object.assign({}, ctx.request.query, ctx.request.body)
        }
        ctx._httpContext = context;


        await next();
    }
}