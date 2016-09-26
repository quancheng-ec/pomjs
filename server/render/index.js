/**
 * Created by joe on 16/9/23.
 */


import _ from 'lodash';
import fs from 'fs';
//const Vue = require('vue');
const renderer = require('vue-server-renderer').createRenderer();
//
//
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer;


const renderPromise = function (code, context) {
    return new Promise(function (resolve, reject) {

        createBundleRenderer(code).renderToString(context, (err, html) => {
            if (err) return reject(err);
            resolve(html);
        });
    });
};


export default function (opts = {}) {


    return async function (ctx, next) {

        let body = ctx._body;
        if (!body) {
            await next();
            return;
        }


        // const app = require('../../dist/server.bundle');

        const html = await renderPromise(fs.readFileSync('/Users/joe/work/hemera-node/dist/index.bundle.js', 'utf8'), ctx._context);


        body = body.replace('{{ html }}', html);



        ctx.body = body;


    }
}