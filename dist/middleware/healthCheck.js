'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _consul = require('../grpc/consul');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * 心跳检测中间件
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * author Zephyr 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


var MESSAGES = {
  NO_SALUKI_CONF: 'No saluki configuration',
  SALUKI_CHECK_FAILED: 'Saluki Health Check Failed'
};

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
    var _ref = _asyncToGenerator(function* (ctx, next) {
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