/**
 *
 * saluki api 查看
 *
 * Created by joe on 16/12/26.
 */


const consul = require('./consul');
module.exports = function (opts = {}) {


    return async function saluki(ctx, next) {
        let url = ctx.url;
        if(url.endsWith('/saluki')){
            ctx.body = JSON.stringify(consul.getALL());
            return;
        }
        await next();
    }
};