"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 *
 * 请求封装
 *
 * Created by joe on 16/9/23.
 */

module.exports = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    return function () {
        var _ref = _asyncToGenerator(function* (ctx, next) {

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

            yield next();
        });

        function http(_x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return http;
    }();
};