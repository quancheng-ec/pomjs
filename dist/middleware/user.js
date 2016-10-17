"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 *
 * 用户服务，接收用户登陆、注册
 *
 * Created by joe on 16/10/16.
 */
//import uid from "uid-safe";

//const sidKey = 'JSESSIONID';

module.exports = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    return function () {
        var _ref = _asyncToGenerator(function* (ctx, next) {

            //
            // if (ctx.path === '/login') {
            //
            //     const userName = ctx.request.body.userName;
            //
            // }
            //
            //
            // // ctx.session = {};
            // console.log(ctx.session.userID);
            //
            // //if (!ctx.session.userID) {
            // ctx.session.userID = '123456';//{userId: '12345', time: (new Date()).timestamp};
            // ctx.session.timestamp = (new Date()).timestamp;
            // // }


            yield next();
        });

        function user(_x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return user;
    }();
};