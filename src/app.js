/**
 * Created by joe on 16/9/22.
 */

const Koa = require('koa');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');

const Path = require('path');

import CSRF from 'koa-csrf'
import session from "koa-session2";
import httpWrap from './middleware/httpWrap'
import route from './middleware/route'
import render from './render'

const app = new Koa();
const serve = require('koa-static');

var root = {};

module.exports = function (opts) {

    root = opts.root;

    const staticPath = Path.join(root, '../static');

    app.use(convert(serve(staticPath)));


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

    app.use(async(ctx, next) => {
        try {
            await next();
        } catch (err) {
            // will only respond with JSON
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = {
                message: err.message
            };
            console.error(err);
        }
    });

    app.use(httpWrap());
    app.use(route(opts));

    app.use(render(opts));


    app.listen(3000);


}