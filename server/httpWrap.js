/**
 *
 * 请求封装
 *
 * Created by joe on 16/9/23.
 */

const _ = require('lodash');


module.exports = function (opts = {}) {


    return async function (ctx, next) {

        const context = {
            url: ctx.url,
            href: ctx.href,
            method: ctx.method,
            host: ctx.host,
            path: ctx.path,
            param: _.extend({}, ctx.request.query, ctx.request.body)
        }
        ctx._httpContext = context;


        await next();
    }
}