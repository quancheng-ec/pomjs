/**
 * 处理Route模块，并执行Control逻辑
 *
 * Created by joe on 16/9/23.
 */

import Path from 'path';

const pageLoader = require('../util/pageLoader');

const DEFAULT_NAME = 'index.js';
const DEFAULT_FILE = 'index/index.js';


export default function (opts = {}) {


    const pageDir = opts.page || Path.join(opts.root, 'pages');

    pageLoader.init(pageDir);
    pageLoader.findPage();

    return async function (ctx, next) {
        let reqPath = ctx.path, ext = "";

        if (reqPath.indexOf('.') !== -1) {
            await next();
            return;
        }


        let pageName = 'index', pagePath, controlPath, action, type = 'render';

        if (reqPath === '/' || reqPath === '') {
            controlPath = Path.join(pageDir, 'index/index.js');
            pagePath = Path.join(pageDir, pageName);
            action = 'view';
        } else {
            if (reqPath.endsWith('/')) {
                //去掉末尾的 ／
                reqPath = reqPath.substring(0, reqPath.length - 1);
            }

            // 请求路径 /api/xxxx,执行api操作
            // 如 /api/user/get 需要找到 pages/user/index.js.get()
            // /api/user pages/index.js.user()

            let parrs;
            if (reqPath.startsWith('/api/')) {
                type = 'api';
                parrs = reqPath.substring(5).split('/');
            } else {
                parrs = reqPath.substring(1).split('/');
            }

            if (parrs.length === 1) {
                controlPath = Path.join(pageDir, DEFAULT_FILE);
                pagePath = Path.join(pageDir, pageName);
                action = parrs[0];
            } else if (parrs.length === 2) {
                controlPath = Path.join(pageDir, parrs[0], DEFAULT_NAME);
                pagePath = Path.join(pageDir, parrs[0]);
                pageName = parrs[0];
                action = parrs[1];
            } else {
                let e = new Error('the path:' + ctx.path + ' not found!');
                e.statusCode = 404;
                throw e;
            }
        }

        const control = pageLoader.getAPI(controlPath, action);

        if (!control) {
            await next();
            return;
        }

        ctx.status = 200;

        const context = Object.assign({}, ctx._httpContext);

        let result = control.call(context, ctx);

        if (typeof result !== 'object') {
            let e = new Error('the ' + api + ' result must be Object');
            e.statusCode = 500;
            throw e;
        }

        if (type === 'api') {
            ctx.body = JSON.stringify(result);
            return;
        }

        ctx.context = Object.assign({}, {
            context: context, pageContext: {
                pagePath: pagePath,
                pageName: pageName,
                pageAction: action
            }
        }, result);

        await next();
    }
}