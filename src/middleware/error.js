/**
 *
 * 系统错误处理
 *
 * Created by joe on 16/10/13.
 */



module.exports = function (opts = {}) {


    return async function error(ctx, next) {

        try {
            await next();
        } catch (err) {
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = {
                error: err.message
            };
            if (ctx.status !== 404) {
                console.error(err);
            }
        }
    }
}