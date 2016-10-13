/**
 * Created by joe on 16/9/23.
 */


import fs from 'fs';
const Path = require('path');
const renderer = require('vue-server-renderer').createRenderer();
//
//
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer;

const webpack = require('webpack');
const MemoryFS = require("memory-fs");
const serverFs = new MemoryFS();


const clientConfig = require('../../webpack.config');
const serverConfig = require('../../webpack.server.config');


const renderPromise = function (code, context) {
    return new Promise(function (resolve, reject) {

        createBundleRenderer(code).renderToString(context, (err, html) => {
            if (err) return reject(err);
            resolve(html);
        });
    });
};


const serverCompileRun = function (compile) {
    return new Promise(function (resolve, reject) {
        compile.run((err, stats) => {
            if (err) return reject(err);


            console.log(stats.toString({
                chunks: false, // Makes the build much quieter
                colors: true
            }));

            resolve(stats);
        });
    });
};


const pageLoader = require('../util/pageLoader');


export default function (opts = {}) {

    const layouts = opts.layouts || Path.join(opts.root, "layouts");

    serverConfig.entry = pageLoader.getServerEntry();


    const serverCompiler = webpack(serverConfig);
    serverCompiler.outputFileSystem = serverFs;

    let stats;
    serverCompileRun(serverCompiler).then(function (f) {
        stats = f;
    }).catch(function (error) {
        console.error(error);
    });

    return async function (ctx, next) {

        if (!ctx.context) {
            await next();
            return;
        }

        const pageContext = ctx.context.pageContext;

        let body = fs.readFileSync(Path.join(layouts, "default.html")).toString();

        body = body.replace('{{ title }}', ctx.context.title || "hello pomjs!");

        const contextData = "var __vue_context_data=" + JSON.stringify(ctx.context) + ";";

        const sr = " <script>" + contextData + "</script>\n <script src='/dist/" + pageContext.pageName + ".bundle.js'></script>";
        body = body.replace('{{ page.js }}', sr);

        if (process.env.NODE_ENV !== 'production') {
            stats = await serverCompileRun(serverCompiler);
        }
        const renderJS = stats.compilation.assets[pageContext.pageName+'.bundle.js'].existsAt;//serverCompiler.outputPath+"/main.bundle.js";

        const html = await renderPromise(serverFs.readFileSync(renderJS, 'utf8'), ctx.context);

        body = body.replace('{{ html }}', html);
        ctx.body = body;

        ctx.type = 'text/html; charset=utf-8';

    }
}