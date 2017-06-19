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
 *
 * zhuliang.li, modified on 20170619
 * 1. 修改了Timer的实现，暂时去除timer stack的功能
 * 2. 调整了打点(卡时间)的功能，通常使用如下：
 *    group和path用于统计，已经对于所有请求、外部中间件、控制器、render加好了打点，Kibana上可以看
 *    (已经保存了一个查询node-request-stat)
 *    ```
 *    let timer = new ctx.logger.Timer({
 *      group: 'request',
 *      path: `${ctx.method} ${ctx.url}`
 *    });
 *
 *    await user_funcitons();
 *
 *    timer.split();
 *    ```
 *
 * TODO:
 *  1. logstashUDP会污染全局的config，需要自己做一个Appender比较好
 *  2. NullLogger太dirty了，要再改进一下
 *  3. 加强traceId的作用
 */

'use strict';

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
            ctx.logger.Timer = _lodash2.default.bind(InnerTimer, {}, ctx.logger);

            var timer = new ctx.logger.Timer({
                group: 'request',
                path: ctx.method + " " + ctx.url
            });

            yield next();

            timer.split();
        });

        function log(_x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return log;
    }();
};

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

// always return a dummy logger
function getNullLogger() {
    return new Proxy({}, {
        get: function get(target, propKey) {

            // not proxy for Timer
            if (propKey === 'Timer') {
                return _lodash2.default.bind(InnerTimer, {}, undefined);
            }

            return function () {};
        },
        apply: function apply(target, object, args) {}
    });
}

function InnerTimer(logger, context) {

    this.logger = logger || getNullLogger();
    this.start = this.last = new Date();

    //this.timePoints = [this.start];
    this.context = context || {};

    this.logger.info('timer starting...', _lodash2.default.assign(this.context, { timerType: 'start' }));

    this.reset = function reset() {
        this.start = this.last = new Date();
        //this.timePoints = [this.start];
    };

    this.split = function split() {
        var now = new Date();

        var offset = now - this.last;
        this.last = now;
        //this.timePoints.push(now);

        this.logger.info("timer splited (" + offset + "ms)", _lodash2.default.assign(this.context, { duration: offset, timerType: 'end' }));

        return offset;
    };
}