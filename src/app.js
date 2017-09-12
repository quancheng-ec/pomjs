/**
 * Created by joe on 16/9/22.
 */


const Koa = require('koa');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');
const cors = require("koa-cors");
const session = require("koa-session");

const Path = require('path');

import CSRF from 'koa-csrf'
import LRU from 'lru-cache'

import httpWrap from './middleware/http';
import route from './middleware/route';
import render from './middleware/render';
import error from './middleware/error';
import bundle from './middleware/bundle';
import multer from './middleware/multer';
import user from './middleware/user';
import saluki from './middleware/saluki';
import cache from './middleware/cache';
import log from './middleware/logger';
import healthCheck from './middleware/healthCheck'
import spartaSession from './middleware/spartaSession'
import grpcClient from './grpc'

const app = new Koa();
const serve = require('koa-static');

var root = {};

async function middleware(opts) {
    grpcClient.grpcOptions = Object.assign(grpcClient.grpcOptions, opts.saluki.grpcOptions)
    await grpcClient.init(opts);
}

/**
 * 合并环境变量和配置变量，以环境变量为准
 * 将 pomjs_ 开头的环境变量作为config参数给应用
 * 如 pomjs_saluki.group=123
 * @param opts
 */
function mergeEnv(opts) {
    const env = process.env;
    Object.assign(process.env, opts)
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
                    if (!eval(temp) || index === vs.length - 1) {
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
    console.log('start pomjs with config:', opts);
    root = opts.root;
    const staticPath = opts.static || Path.join(root, 'static');

    middleware(opts);

    app.use(log(opts));

    app.use(convert(serve(staticPath, { maxage: 60 * 60 * 24 * 365 })));
    // set the session keys
    app.keys = ['qc'];
    // add session support
    const sessionConfig = {
        key: 'pomjs', /** (string) cookie key (default is koa:sess) */
        maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
        overwrite: true, /** (boolean) can overwrite or not (default true) */
        httpOnly: true, /** (boolean) httpOnly or not (default true) */
        signed: true, /** (boolean) signed or not (default true) */
    };
    if (opts.auth && opts.auth.domain) {
        sessionConfig.domain = opts.auth.domain;
    }
    app.use(convert(session(
        Object.assign(sessionConfig, opts.session), app
    )));

    //如果配置了cors（解决跨域问题）, 则加入中间件
    if (opts.cors) {
        app.use(cors(opts.cors));
    }

    const appCache = LRU(opts.cache || { maxAge: 1000 * 60 * 60, max: 10000 })
    app.use(cache({
        cache: appCache
    }));
    // add multipart/form-data parsing
    app.use(multer(opts.uploadConfig || {}));

    // add body parsing
    app.use(bodyParser({
        jsonLimit: '10mb',
        textLimit: '10mb'
    }));

    // add the CSRF middleware
    app.use(new CSRF(Object.assign({
        invalidSessionSecretMessage: 'Invalid session secret',
        invalidSessionSecretStatusCode: 403,
        invalidTokenMessage: 'Invalid CSRF token',
        invalidTokenStatusCode: 403,
        excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
        disableQuery: false
    }, opts.csrf)));

    app.use(error(opts));
    app.use(saluki(opts));
    app.use(httpWrap(opts));
    app.use(bundle(opts));
    app.use(healthCheck(opts))

    if (opts.spartaSession) {
        app.use(spartaSession(opts))
    }

    app.use(user(opts));

    //外接中间件
    if (opts.middlewares) {
        opts.middlewares.forEach(function (js) {
            let t = async function (ctx, next) {
                let m = js.split('/').pop();
                let timer = new ctx.logger.Timer({
                    group: 'middleware',
                    path: m
                });
                await convert(require(js)(opts))(ctx, next);
                timer.split();
            };
            app.use(t);
        });
    }

    app.use(route(opts));
    app.use(render(opts));
    let port = opts.port || 3000;
    if (typeof port === 'string') {
        port = parseInt(port);
    }
    app.listen(port);
    console.log('listening on ', port);

};
