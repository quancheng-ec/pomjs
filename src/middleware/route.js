/**
 * 处理Route模块，并执行Control逻辑
 *
 * Created by joe on 16/9/23.
 */

import Path from 'path';
var fetch = require('node-fetch');

const pageLoader = require('../util/pageLoader');

const DEFAULT_NAME = 'index.js';
const DEFAULT_FILE = 'index/index.js';

const services = require('../grpc/index').services();


export default function (opts = {}) {

    pageLoader.init(opts);
    const pageDir = opts.isProduction ? opts.page.build : opts.page.src;

    return async function route(ctx, next) {
        let reqPath = ctx.path, ext = "";

        if (reqPath.indexOf('.') !== -1) {
            await next();
            return;
        }

        let control, pageName = 'index', pagePath, controlPath, action, type = 'render';

        if (reqPath === '/' || reqPath === '') {
            controlPath = Path.join(pageDir, 'index/index.js');
            pagePath = Path.join(pageDir, pageName);
            action = 'view';
            control = pageLoader.getAPI(controlPath, action);
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
            } else if (reqPath.startsWith('/event/')) {
                type = 'event';
                parrs = reqPath.substring(7).split('/');
            } else {
                parrs = reqPath.substring(1).split('/');
            }

            if (parrs.length === 1) {
                controlPath = Path.join(pageDir, DEFAULT_FILE);
                pagePath = Path.join(pageDir, pageName);
                action = parrs[0];
                control = pageLoader.getAPI(controlPath, action);
            } else if (parrs.length === 2) {
                controlPath = Path.join(pageDir, parrs[0], DEFAULT_NAME);
                pagePath = Path.join(pageDir, parrs[0]);
                pageName = parrs[0];
                action = parrs[1];
                control = pageLoader.getAPI(controlPath, action);
                if (!control) {
                    controlPath = Path.join(__dirname, '../pages', parrs[0], DEFAULT_NAME);
                    control = pageLoader.getAPI(controlPath, action);
                }

            } else {
                let e = new Error('the path:' + ctx.path + ' not found!');
                e.statusCode = 404;
                throw e;
            }
        }


        if (!control) {
            await next();
            return;
        }

        ctx.status = 200;

        const context = Object.assign({}, ctx._httpContext);

        ctx.context = Object.assign({},context, {
            context: context, pageContext: {
                pagePath: pagePath,
                pageName: pageName,
                pageAction: action
            }, csrf: ctx.csrf
        });

        let result = await control(ctx,services);

        if (typeof result !== 'object') {
            let e = new Error('the ' + api + ' result must be Object');
            e.statusCode = 500;
            throw e;
        }

        if (type === 'event') {
            return;
        }

        if (type === 'api') {
            ctx.body = result;
            return;
        }

        ctx.context = Object.assign(ctx.context, result);

        await next();
    }
}