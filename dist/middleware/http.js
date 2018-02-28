'use strict';

var _bluebird = require('bluebird');

/**
 *
 * 请求封装
 *
 * Created by joe on 16/9/23.
 */

var fetch = require('node-fetch');

module.exports = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    return function () {
        var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {

            if (ctx.path === '/favicon.ico') return;

            ctx.opts = opts;

            var context = {
                url: ctx.url,
                href: ctx.href,
                method: ctx.method,
                host: ctx.host,
                path: ctx.path,
                param: Object.assign({}, ctx.request.query, ctx.request.body)
            };
            ctx._httpContext = context;
            ctx.fetch = fetch;

            yield next();
        });

        function http(_x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return http;
    }();
};