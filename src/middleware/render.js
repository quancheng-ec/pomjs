/**
 * Created by joe on 16/9/23.
 */


import fs from 'fs';
const Path = require('path');
const renderer = require('vue-server-renderer').createRenderer();
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer;
const cache = {};
const pageLoader = require('../util/pageLoader');


const renderPromise = function (pageName, code, context) {
    return new Promise(function (resolve, reject) {
        let cr = cache[pageName];
        if (!cr || !pageLoader.isProduction()) {
            cr = createBundleRenderer(code);
            cache[pageName] = cr;
        }
        cr.renderToString(context, (err, html) => {
            if (err) return reject(err);
            resolve(html);
        });
    });
};


export default function (opts = {}) {

    const layouts = opts.layouts || Path.join(opts.root, "layouts");
    if (!opts.isProduction) {
        pageLoader.initCompile(opts);
    }

    return async function render(ctx, next) {

        if (!ctx.context) {
            await next();
            return;
        }

        ctx.logger.info("--> render");

        const pageContext = ctx.context.pageContext;

        let body = fs.readFileSync(Path.join(layouts, ctx.context.layout || "default.html")).toString();
        body = body.replace('{{ title }}', ctx.context.title || "hello pomjs!");
        body = body.replace('{{ keywords }}', ctx.context.keywords || "");
        body = body.replace('{{ description }}', ctx.context.description || "");


        const scriptName = pageContext.pageName + ".bundle.js";
        let script = pageLoader.getClientFilePath(scriptName);
        let vendor = pageLoader.getClientFilePath('vendor.bundle.js');
        //如果配置了cdn域名
        if (opts.cdndomain) {
            script = opts.cdndomain + script;
            vendor = opts.cdndomain + vendor;
        }

        const contextData = "var __vue_context_data=" + JSON.stringify(ctx.context) + ";";
        const sr = " <script>" + contextData + "</script>\n <script src='" + vendor + "'></script>\n <script src='" + script + "'></script>";
        body = body.replace('{{ page.js }}', sr);

        if (process.env.NODE_ENV !== 'production') {
            await pageLoader.compileRun();
        }

        const html = await renderPromise(scriptName, pageLoader.readServerFileSync(scriptName), ctx.context);

        body = body.replace('{{ html }}', html);
        const cssFileName = pageContext.pageName + ".style.css";
        if (process.env.NODE_ENV === 'production') {
            let csspath = pageLoader.getClientFilePath(cssFileName);
            body = body.replace('{{ stylesheet }}', "<link href='" + csspath + "' rel='stylesheet'></link>")
        } else {
            const styles = pageLoader.readClientFile(cssFileName).toString();
            body = body.replace('{{ stylesheet }}', "<style rel='stylesheet'>" + styles + "</style>")
        }

        ctx.body = body;

        ctx.type = 'text/html; charset=utf-8';

        ctx.logger.info("<-- render");
    }
}
