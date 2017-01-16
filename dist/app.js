'use strict';

var middleware = function () {
  var _ref = _asyncToGenerator(function* (opts) {
    yield require('./grpc/index').init(opts);
  });

  return function middleware(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * 合并环境变量和配置变量，以环境变量为准
 * 将 pomjs_ 开头的环境变量作为config参数给应用
 * 如 pomjs_saluki.group=123
 * @param opts
 */


var _koaCsrf = require('koa-csrf');

var _koaCsrf2 = _interopRequireDefault(_koaCsrf);

var _koaSession = require('koa-session2');

var _koaSession2 = _interopRequireDefault(_koaSession);

var _http = require('./middleware/http');

var _http2 = _interopRequireDefault(_http);

var _route = require('./middleware/route');

var _route2 = _interopRequireDefault(_route);

var _render = require('./middleware/render');

var _render2 = _interopRequireDefault(_render);

var _error = require('./middleware/error');

var _error2 = _interopRequireDefault(_error);

var _bundle = require('./middleware/bundle');

var _bundle2 = _interopRequireDefault(_bundle);

var _multer = require('./middleware/multer');

var _multer2 = _interopRequireDefault(_multer);

var _user = require('./middleware/user');

var _user2 = _interopRequireDefault(_user);

var _saluki = require('./middleware/saluki');

var _saluki2 = _interopRequireDefault(_saluki);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by joe on 16/9/22.
 */

var Koa = require('koa');
var convert = require('koa-convert');
var bodyParser = require('koa-bodyparser');

var Path = require('path');

var app = new Koa();
var serve = require('koa-static');

var root = {};

function mergeEnv(opts) {
  var env = process.env;
  Object.assign(process.env, opts);
  //用环境变量替换当前配置
  for (var i in env) {
    if (i.startsWith('pomjs_')) {
      var config = i.substring(6);
      if (config.indexOf('_') == -1) {
        opts[config] = env[i];
      } else {
        var temp = 'opts';
        var vs = config.split('_');
        // 替换 xxx_xxx_xxx --> {'xxx':{'xxx':'xxx'}}
        for (var index = 0; index < vs.length; index++) {
          temp += '.' + vs[index];
          if (!eval(temp) || index === vs.length - 1) {
            var tempValue = index < vs.length - 1 ? '{}' : "'" + env[i] + "'";
            eval(temp + '=' + tempValue);
          }
        }
      }
    }
  }
}

module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!opts.root) {
    var index = __dirname.indexOf('node_modules');
    if (index != -1) {
      opts.root = __dirname.substring(0, index);
    } else {
      throw new Error('the opts.root can not null');
    }
  }
  mergeEnv(opts);
  console.log('start pomjs with config:', opts);
  root = opts.root;
  var staticPath = opts.static || Path.join(root, 'static');

  middleware(opts);

  app.use(convert(serve(staticPath, { maxage: 60 * 60 * 24 * 365 })));
  // set the session keys
  app.keys = ['qc'];
  // add session support
  app.use((0, _koaSession2.default)({
    key: "SESSIONID" //default "koa:sess"
  }));

  // add multipart/form-data parsing
  app.use((0, _multer2.default)(opts.uploadConfig || {}));

  // add body parsing
  app.use(bodyParser());

  // add the CSRF middleware
  app.use(new _koaCsrf2.default(Object.assign({
    invalidSessionSecretMessage: 'Invalid session secret',
    invalidSessionSecretStatusCode: 403,
    invalidTokenMessage: 'Invalid CSRF token',
    invalidTokenStatusCode: 403,
    excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
    disableQuery: false
  }, opts.csrf)));

  app.use(function () {
    var _ref2 = _asyncToGenerator(function* (ctx, next) {
      var start = new Date();
      yield next();
      var ms = new Date() - start;
      ctx.set('X-Response-Time', ms + 'ms');
    });

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());

  app.use((0, _error2.default)(opts));
  app.use((0, _saluki2.default)(opts));
  app.use((0, _http2.default)(opts));
  app.use((0, _bundle2.default)(opts));

  //外接中间件
  if (opts.middlewares) {
    opts.middlewares.forEach(function (js) {
      console.log(js);
      app.use(convert(require(js)(opts)));
    });
  }

  app.use((0, _route2.default)(opts));
  app.use((0, _render2.default)(opts));
  var port = opts.port || 3000;
  if (typeof port === 'string') {
    port = parseInt(port);
  }
  app.listen(port);
  console.log('listening on ', port);
};