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
import user from './middleware/user';

const app = new Koa();
const serve = require('koa-static');

var root = {};

async function middleware(opts) {
    await require('./grpc/index').init(opts);
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

    // add body parsing
    app.use(bodyParser());

    // add the CSRF middleware
    app.use(new CSRF({
        invalidSessionSecretMessage: 'Invalid session secret',
        invalidSessionSecretStatusCode: 403,
        invalidTokenMessage: 'Invalid CSRF token',
        invalidTokenStatusCode: 403,
        excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
        disableQuery: false
    }));


    app.use(async function (ctx, next) {
        const start = new Date();
        await next();
        const ms = new Date() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
    });

    app.use(error());
    app.use(httpWrap());
    app.use(bundle())
    //app.use(user());
    app.use(route(opts));
    app.use(render(opts));
    const port = opts.port || 3000;
    app.listen(port);
    console.log('listening on ', port);

}