'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    // const maxAge = 60 * 60 * 24 * 365;//1年

    return function () {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            var reqPath = ctx.url;
            if (pageLoader.isProduction() || !reqPath.startsWith('/bundle')) {
                yield next();
                return;
            }

            reqPath = reqPath.substring(8);
            var pageName = reqPath.split('/')[0];

            // if (!pageLoader.isProduction()) {
            ctx.body = pageLoader.readClientFile(pageName);
            // ctx.lastModified = lastModified;
            // ctx.set('Cache-Control', 'max-age=' + 60 * 5);//单位s 5分钟
            // }
        });

        function bundle(_x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return bundle;
    }();
};

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 *
 * 执行webpack编译后的bundle资源加载
 *
 * Created by joe on 2016/10/14.
 */

var pageLoader = require('../util/pageLoader');
var fs = require('fs');