
const path = require('path');
const fs = require('fs');
const glob = require("glob");

const log4js = require('koa-log4');
const logger = log4js.getLogger('pomjs_render');
const devServer = require('./dev-server');
/**
 *
 * webpack koa2 处理
 *
 * Created by joe on 17/4/4.
 */

let renderer;
const isProd = process.env.NODE_ENV === 'production';


module.exports = function (option = {}, app) {

    let page = {
        src: path.join(option.src, 'pages'),
        build: path.join(option.build, 'pages'),
        static: option.static || path.join(option.root, 'static')
    };


   let vueFileMaps =  handlerPages(option, page)


    if (isProd) {
        const bundle = require('../../../example/dist/vue-ssr-bundle.json');
        const template = fs.readFileSync(path.resolve(__dirname, '../../../example/static/dist/index.html'), 'utf-8');
        renderer = createRenderer(bundle, template);
    } else {
        devServer(app, webPackCb);
    }

    return async function render(ctx, next) {


        if (ctx.path === '/index') {

            let context = {
                url: ctx.url
            };

            renderer.renderToString(context, (err, html) => {
                if (err) {
                    logger.error(err);
                    ctx.body = err;
                } else {
                    ctx.set("Content-Type", "text/html");
                    ctx.status = 200;
                    let body = html.repl;

                    const contextData = "var __vue_context_data=" + JSON.stringify(context) + ";";
                    const sr = " <script>" + contextData + "</script>\n</script>";
                    body = html.replace('{{ page.js }}', sr);

                    ctx.body = body;
                }

            });

            return;
        }

        await next();

    }
}

const webPackCb = (bundle, template) => {
    renderer = createRenderer(bundle, template)
}

function createRenderer(bundle, template) {
    // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
    return require('vue-server-renderer').createBundleRenderer(bundle, {
        template,
        cache: require('lru-cache')({
            max: 1000,
            maxAge: 1000 * 60 * 15
        })
    })
}

/**
 *  return 
 * { 
 *   'index/view.vue': '/Users/joe/work/pomjs/example/src/pages/index/view.vue',
     'user/view.vue': '/Users/joe/work/pomjs/example/src/pages/user/view.vue'
   }
 * @param {*} option 
 * @param {*} page 
 */
function handlerPages(option, page) {
    let cache = {};
    glob.sync(path.join(page.src, "**/*.vue")).forEach(f=>{
        let names = f.split('/');
        let key = names[names.length-2]+"/"+names[names.length-1];
        cache[key] = f;
    });
    return cache;
}