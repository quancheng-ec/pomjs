'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _consul = require('../grpc/consul');

var MESSAGES = {
  NO_SALUKI_CONF: 'No saluki configuration',
  SALUKI_CHECK_FAILED: 'Saluki Health Check Failed'
}; /**
    * 心跳检测中间件
    * author Zephyr 
    */


var DEFAULT_HEALTHCHECK_URL = '/api/healthCheck';
var SALUKI_HEALTHY_STATUS = 'SERVING';

var makeRespond = function makeRespond(ctx) {
  return function (code, message) {
    ctx.status = code;
    ctx.body = {
      isHealth: code < 400,
      message: message
    };
  };
};

exports.default = function (opts) {
  var healthCheckUrl = opts.healthCheckUrl;

  return function () {
    var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {
      var respond = makeRespond(ctx);
      // no saluki config, pass
      if (!opts.saluki) {
        respond(200, MESSAGES.NO_SALUKI_CONF);
      }

      // if hitting healthCheck path
      // check saluki service health check
      healthCheckUrl = healthCheckUrl || DEFAULT_HEALTHCHECK_URL;
      if (ctx.path === healthCheckUrl) {

        try {

          yield Promise.all(opts.saluki.group.map(function (group) {
            return (0, _consul.consulClient)().health.service({
              service: 'saluki_' + group,
              passing: true
            });
          }));

          respond(200);
        } catch (e) {
          respond(500, e.message);
        }

        return;
      }
      yield next();
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
};