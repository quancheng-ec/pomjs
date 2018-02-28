'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  pageLoader.init(opts);
  var pageDir = opts.isProduction ? opts.page.build : opts.page.src;

  return function () {
    var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {
      var reqPath = ctx.path,
          ext = '';

      if (reqPath.indexOf('.') !== -1) {
        yield next();
        return;
      }

      var control = void 0,
          pageName = 'index',
          pagePath = void 0,
          controlPath = void 0,
          action = void 0,
          type = 'render';

      if (reqPath === '/' || reqPath === '') {
        controlPath = _path2.default.join(pageDir, 'index/index.js');
        pagePath = _path2.default.join(pageDir, pageName);
        action = 'view';
        control = pageLoader.getAPI(controlPath, action);
      } else {
        if (reqPath.endsWith('/')) {
          //去掉末尾的 ／
          reqPath = reqPath.substring(0, reqPath.length - 1);
        }

        // 请求路径 /api/xxxx,执行api操作
        // 如 /api/user/get 需要找到 pages/user/index.js.get()
        // /api/user pages/index.js.user()

        var parrs = void 0;
        if (reqPath.startsWith('/api/')) {
          type = 'api';
          parrs = reqPath.substring(5).split('/');
        } else if (reqPath.startsWith('/event/')) {
          type = 'event';
          parrs = reqPath.substring(7).split('/');
        } else {
          parrs = reqPath.substring(1).split('/');
        }

        if (parrs.length === 1) {
          controlPath = _path2.default.join(pageDir, DEFAULT_FILE);
          pagePath = _path2.default.join(pageDir, pageName);
          action = parrs[0];
          control = pageLoader.getAPI(controlPath, action);
        } else if (parrs.length === 2) {
          controlPath = _path2.default.join(pageDir, parrs[0], DEFAULT_NAME);
          pagePath = _path2.default.join(pageDir, parrs[0]);
          pageName = parrs[0];
          action = parrs[1];
          control = pageLoader.getAPI(controlPath, action);
          if (!control) {
            controlPath = _path2.default.join(__dirname, '../pages', parrs[0], DEFAULT_NAME);
            control = pageLoader.getAPI(controlPath, action);
          }
        } else {
          var e = new Error('the path:' + ctx.path + ' not found!');
          e.statusCode = 404;
          throw e;
        }
      }

      if (!control) {
        yield next();
        return;
      }

      ctx.status = 200;

      var context = Object.assign({}, ctx._httpContext);

      ctx.context = Object.assign({}, context, {
        context: context,
        pageContext: {
          pagePath: pagePath,
          pageName: pageName,
          pageAction: action
        },
        csrf: ctx.csrf,
        _token: ctx.response.header.token,
        _client: opts.clientData,
        _user: ctx.user
      });

      var controlResult = {
        isSuccess: true,
        errorCode: 0,
        errorMessage: '',
        data: {}
      };

      try {
        var proxyedServices = {};

        var _loop = function _loop(key) {
          if (!ctx.services.hasOwnProperty(key)) return 'continue';

          proxyedServices[key] = new Proxy(ctx.services[key], {
            get: function get(target, propKey, receiver) {
              var origMethod = target[propKey];
              if (typeof origMethod === 'function') {
                return (0, _bluebird.coroutine)(function* () {
                  var timer = new ctx.logger.Timer({
                    group: 'service',
                    path: key + '.' + propKey
                  });
                  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                  }

                  (args[1] || (args[1] = {})).companyId = ctx.response.header.companyid || '';
                  var result = yield origMethod.apply(this, args);
                  timer.split();
                  return result;
                });
              } else {
                return origMethod;
              }
            }
          });
        };

        for (var key in ctx.services) {
          var _ret = _loop(key);

          if (_ret === 'continue') continue;
        }

        var timer = new ctx.logger.Timer({
          group: 'controller',
          path: pageName + ':' + action
        });

        controlResult.data = yield control(ctx, proxyedServices);
        timer.split();
      } catch (e) {
        console.error(e);
        controlResult.isSuccess = false;
        controlResult.errorCode = e.code;
        controlResult.errorMessage = e.message;
      }

      // if (typeof result !== 'object') {
      //     let e = new Error('the ' + api + ' result must be Object');
      //     e.statusCode = 500;
      //     throw e;
      // }

      if (type === 'event') {
        if (controlResult.data) {
          ctx.body = controlResult.data;
        }
        return;
      }

      if (type === 'api') {
        ctx.body = controlResult;
        return;
      }

      ctx.context = Object.assign(ctx.context, controlResult.data);

      yield next();
    });

    function route(_x2, _x3) {
      return _ref.apply(this, arguments);
    }

    return route;
  }();
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetch = require('node-fetch'); /**
                                    * 处理Route模块，并执行Control逻辑
                                    *
                                    * Created by joe on 16/9/23.
                                    */

var pageLoader = require('../util/pageLoader');

var DEFAULT_NAME = 'index.js';
var DEFAULT_FILE = 'index/index.js';