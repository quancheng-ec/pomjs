/**
 *
 * http wrap 除了请求static资源之外，所有的请求都会被该中间件加工一下
 * 
 * Created by joe on 16/4/4.
 */

const serverInfo =
    `pomjs/${require('../../package.json').version} ` +
    `koa/${require('koa/package.json').version} ` +
    `vue-server-renderer/${require('vue-server-renderer/package.json').version}`;

const isProd = process.env.NODE_ENV === 'production'


module.exports = function (opts = {}) {

    return async function wrap(ctx, next) {

        // 忽略 favicon 请求
        if (ctx.url === '/favicon.ico') {
            return;
        }
        //注册到上下午
        ctx.isProd = isProd;
        const start = new Date();
        return next().then(() => {
            const ms = new Date() - start;
            ctx.set('X-Response-Time', `${ms}ms`);
            ctx.set('Server', serverInfo);

        });
    }
}