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

const log4js = require("log4js"),
      util = require("util"),
      uuidV4 = require("uuid/v4");

function getLogger(opts, requestId) {
    if (!opts.log4js) {
        return null;
    }

    log4js.layouts.addLayout('json', config => function (logEvent) {
        let message = '';

        // CAUTION: currently only support [message_string, context_object]
        // logevent is supposed to be like: [aaa %s bbb, aaa, ... , {context}]
        let context = {
            requestId: requestId || uuidV4()
        };

        if (Array.isArray(logEvent.data) && logEvent.data.length > 0) {

            // if last one is object, treat it as a context
            if (typeof(logEvent.data[logEvent.data.length - 1]) === 'object') {
                let lastElement = logEvent.data.pop();
                Object.assign(context, lastElement);
            }

            message = util.format.apply(util, logEvent.data);
        } else if (typeof(logEvent.data) === 'object') {
            Object.assign(context, logEvent.data);
        } else {
            message = JSON.stringify(logEvent.data);
        }

        // set back to logevent data [formatted_message_string, context_object]
        logEvent.data = [message, context];

        return message;
    });

    log4js.configure(opts.log4js);
    return log4js.getLogger('request');
}

// always return a dummy logger
function getNullLogger() {
    return new Proxy({
    }, {
        get: function (target, propKey) {

            // not proxy for Timer
            if (propKey === 'Timer') {
                return Timer;
            }

            return function () {
            };
        },
        apply: function (target, object, args) {
        }
    });
}

function Timer() {
    this.start = this.last = new Date();

    this.timePoints = [this.start];

    this.reset = function reset () {
        this.start = this.last = new Date();
        this.timePoints = [this.start];
    };

    this.split = function split () {
        const now = new Date();

        const offset = now - this.last;
        this.last    = now;
        this.timePoints.push(now);

        return offset;
    };
}

export default function (opts = {}) {
    return async function log(ctx, next) {
        ctx.requestId    = uuidV4();
        let logger       = getLogger(opts, ctx.requestId);
        ctx.logger       = logger || getNullLogger();
        ctx.logger.Timer = Timer;
        ctx.logger.timer = new Timer();

        let timer = new Timer();
        ctx.logger.info(`--> ${ctx.method} ${ctx.url}`);
        await next();
        ctx.logger.info(`<-- ${ctx.method} ${ctx.url} (${timer.split()}ms)`);
    }
}