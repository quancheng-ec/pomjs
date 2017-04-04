/**
 * Created by joe on 16/9/22.
 */
'use strict'


// require('babel-register')({
//     "plugins": [
//         "transform-async-to-generator",
//         "transform-es2015-modules-commonjs"
//     ]
// });

const Koa = require('koa');
const app = new Koa();
const Path = require('path');

const log4js = require('koa-log4')
const logger = log4js.getLogger('pomjs')

const resolve = file => path.resolve(__dirname, file)

const plugin = require('./plugins')(app);

//默认参数
let defaultOptions = {
    _plugins: plugin.plugins,  // 系统插件
    plugins: []    // 用户插件
}



module.exports = function (options) {
    options = Object.assign(options || {}, defaultOptions);

    //加载插件
    plugin.loadPlugins(options._plugins, options);

    // response

    app.use(ctx => {
        ctx.body = 'Hello World';
        console.log(ctx.session);
        ctx._session.a = 456;
    });


    app.listen(options.port || 3000);


}

