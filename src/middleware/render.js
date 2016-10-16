/**
 * Created by joe on 16/9/23.
 */


import fs from 'fs';
const Path = require('path');
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


const pageLoader = require('../util/pageLoader');


export default function (opts = {}) {

    const layouts = opts.layouts || Path.join(opts.root, "layouts");

    pageLoader.initCompile();

    return async function render(ctx, next) {

        if (!ctx.context) {
            await next();
            return;
        }

        const pageContext = ctx.context.pageContext;

        let body = fs.readFileSync(Path.join(layouts, "default.html")).toString();
        body = body.replace('{{ title }}', ctx.context.title || "hello pomjs!");

        const scriptName = pageContext.pageName + ".bundle.js";
        const script = "/bundle/" + scriptName;

        const contextData = "var __vue_context_data=" + JSON.stringify(ctx.context) + ";";
        const sr = " <script>" + contextData + "</script>\n <script src='" + script + "'></script>";
        body = body.replace('{{ page.js }}', sr);

        if (process.env.NODE_ENV !== 'production') {
            await pageLoader.compileRun();
        }

        const html = await renderPromise(pageLoader.readServerFileSync(scriptName), ctx.context);

        body = body.replace('{{ html }}', html);
        ctx.body = body;

        ctx.type = 'text/html; charset=utf-8';

    }
}