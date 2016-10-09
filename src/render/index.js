/**
 * Created by joe on 16/9/23.
 */


import fs from 'fs';
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

export default function (opts = {}) {

    const serverCompiler = webpack(serverConfig);
    serverCompiler.outputFileSystem = serverFs;

    return async function (ctx, next) {

        if (!ctx._page) {
            await next();
            return;
        }

        let body = fs.readFileSync(opts.root + "/layouts/default.html").toString();

        body = body.replace('{{ title }}', ctx._context.title || "hello pomjs!");

        const contextData = "var __vue_context_data=" + JSON.stringify(ctx._context) + ";";

        const sr = " <script>" + contextData + "</script>\n <script src='/dist/" + ctx._page + ".bundle.js'></script>";
        body = body.replace('{{ page.js }}', sr);


       const stats = await serverCompileRun(serverCompiler);


        ctx._context._page = ctx._page;

        const renderJS = stats.compilation.assets['main.bundle.js'].existsAt;//serverCompiler.outputPath+"/main.bundle.js";

        const html = await renderPromise(serverFs.readFileSync(renderJS, 'utf8'), ctx._context);

        body = body.replace('{{ html }}', html);
        ctx.body = body;


    }
}