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

'use strict'

const log4js = require('log4js'),
  util = require('util'),
  uuidV4 = require('uuid/v4')

import _ from 'lodash'

function getLogger(opts) {
  if (!opts.log4js) {
    return null
  }

  log4js.addLayout(
    'json',
    config =>
      function(logEvent) {
        let message = ''

        // CAUTION: currently only support [message_string, context_object]
        // logevent is supposed to be like: [aaa %s bbb, aaa, ... , {context}]
        let context = {
          //   requestId: requestId || uuidV4()
        }

        if (Array.isArray(logEvent.data) && logEvent.data.length > 0) {
          // if last one is object, treat it as a context
          if (typeof logEvent.data[logEvent.data.length - 1] === 'object') {
            let lastElement = logEvent.data.pop()
            Object.assign(context, lastElement)
          }

          message = util.format.apply(util, logEvent.data)
        } else if (typeof logEvent.data === 'object') {
          Object.assign(context, logEvent.data)
        } else {
          message = JSON.stringify(logEvent.data)
        }

        // set back to logevent data [formatted_message_string, context_object]
        logEvent.data = [message, context]

        return message
      }
  )

  log4js.configure(formatConfig(opts.log4js))
  return log4js.getLogger('request')
}

// format log4jsConfig passed by
// return v2.x styled config
// caused by Migrating from log4js versions older than 2.x
function formatConfig(config) {
  const result = {
    appenders: {
      out: { type: 'console' }
    },
    categories: {
      default: {
        appenders: ['out'],
        level: 'info'
      }
    }
  }
  for (const appender of config.appenders) {
    result.appenders[appender.type] = Object.assign({}, appender)
    ;(result.categories[appender.category] ||
      (result.categories[appender.category] = {
        appenders: [],
        level: 'info'
      }))['appenders'].push(appender.type)
  }
  return result
}

// always return a dummy logger
function getNullLogger() {
  return new Proxy(
    {},
    {
      get: function(target, propKey) {
        // not proxy for Timer
        if (propKey === 'Timer') {
          return _.bind(InnerTimer, {}, undefined)
        }

        return function() {}
      },
      apply: function(target, object, args) {}
    }
  )
}

function InnerTimer(logger, context) {
  this.logger = logger || getNullLogger()
  this.start = this.last = new Date()

  //this.timePoints = [this.start];
  this.context = context || {}

  this.context.requestId = this.logger.requestId || uuidV4()

  this.logger.info(
    'timer starting...',
    _.assign(this.context, { timerType: 'start' })
  )

  this.reset = function reset() {
    this.start = this.last = new Date()
    //this.timePoints = [this.start];
  }

  this.split = function split() {
    const now = new Date()

    const offset = now - this.last
    this.last = now
    //this.timePoints.push(now);

    this.logger.info(
      `timer splited (${offset}ms)`,
      _.assign(this.context, { duration: offset, timerType: 'end' })
    )

    return offset
  }
}

export default function(opts = {}) {
  const logger = getLogger(opts)
  return async function log(ctx, next) {
    ctx.requestId = uuidV4()
    ctx.logger = logger || getNullLogger()
    ctx.logger.requestId = ctx.requestId
    ctx.logger.Timer = _.bind(InnerTimer, {}, ctx.logger)

    let timer = new ctx.logger.Timer({
      group: 'request',
      path: `${ctx.method} ${ctx.url}`
    })

    await next()

    timer.split()
  }
}
