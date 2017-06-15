"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return function () {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            ctx.requestId = uuidV4();
            var logger = getLogger(opts, ctx.requestId);
            ctx.logger = logger || getNullLogger();
            ctx.logger.Timer = Timer;
            ctx.logger.timer = new Timer();

            var timer = new Timer();
            ctx.logger.info("--> " + ctx.method + " " + ctx.url);
            yield next();
            ctx.logger.info("<-- " + ctx.method + " " + ctx.url + " (" + timer.split() + "ms)");
        });

        function log(_x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return log;
    }();
};

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 *
 * 通用打点日志组件
 * 1. 用法：ctx.logger.(info|debug|warn|error)("message", {context})
 *      CAUTION: 参数格式只能是[string, object]
 * 2. 底层使用log4js
 * 3. 使用log4js自带的logstashUDP appender
 * 4. 在config中声明了log4js的object后，才会初始化logger，可以使用
 *
 * Created by zhuliang.li on 20170614.
 */

var log4js = require("log4js"),
    util = require("util"),
    uuidV4 = require("uuid/v4");

function getLogger(opts, requestId) {
    if (!opts.log4js) {
        return null;
    }

    log4js.layouts.addLayout('json', function (config) {
        return function (logEvent) {
            var message = '';

            // CAUTION: currently only support [message_string, context_object]
            // logevent is supposed to be like: [aaa %s bbb, aaa, ... , {context}]
            var context = {
                requestId: requestId || uuidV4()
            };

            if (Array.isArray(logEvent.data) && logEvent.data.length > 0) {

                // if last one is object, treat it as a context
                if (_typeof(logEvent.data[logEvent.data.length - 1]) === 'object') {
                    var lastElement = logEvent.data.pop();
                    Object.assign(context, lastElement);
                }

                message = util.format.apply(util, logEvent.data);
            } else if (_typeof(logEvent.data) === 'object') {
                Object.assign(context, logEvent.data);
            } else {
                message = JSON.stringify(logEvent.data);
            }

            // set back to logevent data [formatted_message_string, context_object]
            logEvent.data = [message, context];

            return message;
        };
    });

    log4js.configure(opts.log4js);
    return log4js.getLogger('request');
}

function getNullLogger() {
    return new Proxy({}, {
        get: function get() {
            return function () {};
        },
        apply: function apply(target, object, args) {}
    });
}

function Timer() {
    this.start = this.last = new Date();

    this.timePoints = [this.start];

    this.reset = function reset() {
        this.start = this.last = new Date();
        this.timePoints = [this.start];
    };

    this.split = function split() {
        var now = new Date();

        var offset = now - this.last;
        this.last = now;
        this.timePoints.push(now);

        return offset;
    };
}