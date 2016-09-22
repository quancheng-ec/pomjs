/**
 * Created by joe on 16/9/22.
 */

const Koa = require('koa');
const convert = require('koa-convert');
const session = require('koa-generic-session');
const bodyParser = require('koa-bodyparser');
const Vue = require('vue');

//const CSRF = require('koa-csrf');

import CSRF from 'koa-csrf'

const app = new Koa();
const serve = require('koa-static');

const renderer = require('vue-server-renderer').createRenderer();


module.exports = function (opts) {

    app.use(convert(serve(opts.root)));


    // set the session keys
    app.keys = ['qc'];

    // add session support
    app.use(convert(session()));

    // add body parsing
    app.use(convert(bodyParser()));

    // add the CSRF middleware
    app.use(new CSRF({
        invalidSessionSecretMessage: 'Invalid session secret',
        invalidSessionSecretStatusCode: 403,
        invalidTokenMessage: 'Invalid CSRF token',
        invalidTokenStatusCode: 403,
        excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
        disableQuery: false
    }));

    const vueVM = new Vue({
        render (h) {
            return h('div', 'hello')
        }
    });


    const renderPromise = function (vm) {
        return new Promise(function (resolve, reject) {

            renderer.renderToString(vm, (err, html) => {
                if (err) return reject(err);
                resolve(html);
            })

        });
    };


    async function renderHandler(ctx, next) {

        if ('/favicon.ico' == ctx.path) {
            ctx.body = "favicon.ico";
            return;
        }


        const start = new Date();
        await next();
        const ms = new Date() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
        var html = await renderPromise(vueVM);

        ctx.body = html;

    }

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
        }
    })

    app.use(renderHandler);


    app.listen(3000);


}