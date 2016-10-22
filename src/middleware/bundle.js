/**
 *
 * 执行webpack编译后的bundle资源加载
 *
 * Created by joe on 2016/10/14.
 */

const pageLoader = require('../util/pageLoader');
const fs = require('fs');

export default function (opts = {}) {

    // const maxAge = 60 * 60 * 24 * 365;//1年

    return async function bundle(ctx, next) {
        let reqPath = ctx.url;
        if (pageLoader.isProduction() || !reqPath.startsWith('/bundle')) {
            await next();
            return;
        }

        reqPath = reqPath.substring(8);
        const pageName = reqPath.split('/')[0];

        // if (!pageLoader.isProduction()) {
        ctx.body = pageLoader.readClientFile(pageName);
        // ctx.lastModified = lastModified;
        // ctx.set('Cache-Control', 'max-age=' + 60 * 5);//单位s 5分钟
        // }

    }
}