/**
 * Created by joe on 16/9/22.
 */


const Koa = require('koa');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');

const Path = require('path');

import CSRF from 'koa-csrf'
import session from "koa-session2";


import httpWrap from './middleware/http';
import route from './middleware/route';
import render from './middleware/render';
import error from './middleware/error';
import bundle from './middleware/bundle';
import multer from './middleware/multer';
import user from './middleware/user';
import saluki from './middleware/saluki';

const app = new Koa();
const serve = require('koa-static');

var root = {};

async function middleware(opts) {
    await require('./grpc/index').init(opts);
}

/**
 * 合并环境变量和配置变量，以环境变量为准
 * 将 pomjs_ 开头的环境变量作为config参数给应用
 * 如 pomjs_saluki.group=123
 * @param opts
 */
function mergeEnv(opts) {
    const env = process.env;
    //用环境变量替换当前配置
    for (let i in env) {
        if (i.startsWith('pomjs_')) {
            const config = i.substring(6);
            if (config.indexOf('_') == -1) {
                opts[config] = env[i];
            } else {
                let temp = 'opts';
                let vs = config.split('_');
                // 替换 xxx_xxx_xxx --> {'xxx':{'xxx':'xxx'}}
                for (let index = 0; index < vs.length; index++) {
                    temp += '.' + vs[index];
                    if (!eval(temp)) {
                        const tempValue = index < vs.length - 1 ? '{}' : "'" + env[i] + "'";
                        eval(temp + '=' + tempValue);
                    }
                }
            }
        }
    }
}

module.exports = function (opts = {}) {
    if (!opts.root) {
        const index = __dirname.indexOf('node_modules');
        if (index != -1) {
            opts.root = __dirname.substring(0, index);
        } else {
            throw new Error('the opts.root can not null');
        }
    }
    mergeEnv(opts);
    root = opts.root;
    const staticPath = opts.static || Path.join(root, 'static');

    middleware(opts);

    app.use(convert(serve(staticPath, {maxage: 60 * 60 * 24 * 365})));
    // set the session keys
    app.keys = ['qc'];
    // add session support
    app.use(session({
        key: "SESSIONID"   //default "koa:sess"
    }));

    // add multipart/form-data parsing
    app.use(multer(opts.uploadConfig || {}));

    // add body parsing
    app.use(bodyParser());

    // add the CSRF middleware
    app.use(new CSRF(Object.assign({
        invalidSessionSecretMessage: 'Invalid session secret',
        invalidSessionSecretStatusCode: 403,
        invalidTokenMessage: 'Invalid CSRF token',
        invalidTokenStatusCode: 403,
        excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
        disableQuery: false
    }, opts.csrf)));


    app.use(async function (ctx, next) {
        const start = new Date();
        await next();
        const ms = new Date() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
    });

    app.use(error());
    app.use(saluki());
    app.use(httpWrap());
    app.use(bundle());
    //app.use(user());
    app.use(route(opts));
    app.use(render(opts));
    let port = opts.port || 3000;
    if (typeof port === 'string') {
        port = parseInt(port);
    }
    app.listen(port);
    console.log('listening on ', port);

};
