'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require('bluebird');

exports.default = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    // const maxAge = 60 * 60 * 24 * 365;//1年

    return function () {
        var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {
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

/**
 *
 * 执行webpack编译后的bundle资源加载
 *
 * Created by joe on 2016/10/14.
 */

var pageLoader = require('../util/pageLoader');
var fs = require('fs');