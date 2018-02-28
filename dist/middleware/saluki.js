'use strict';

var _bluebird = require('bluebird');

/**
 *
 * saluki api 查看
 *
 * Created by joe on 16/12/26.
 */
var services = require('../grpc/index').services();
var consul = require('../grpc/consul');
module.exports = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    return function () {
        var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {
            var url = ctx.url;
            ctx.services = services;
            if (url.endsWith('/saluki')) {
                ctx.body = JSON.stringify(consul.getALL());
                return;
            }
            yield next();
        });

        function saluki(_x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return saluki;
    }();
};