/**
 *
 * render 处理
 *
 * Created by joe on 17/4/4.
 */



module.exports = function (opts = {}) {
    let renderer;
    require('../../build/setup-dev-server')(app, (bundle, template) => {
        renderer = createRenderer(bundle, template)
    })


    return async function render(ctx, next) {

        renderer.renderToStream({ url: req.url })
            .on('error', (res) => {

            })
            .on('end', (res) => console.log(`whole request: ${Date.now() - s}ms`))
            .pipe(ctx);


        // return next().then(() => {
        //     const ms = new Date() - start;
        //     ctx.set('X-Response-Time', `${ms}ms`);
        // });
    }
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