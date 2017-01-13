'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
        var _ref = _asyncToGenerator(function* (ctx, next) {
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