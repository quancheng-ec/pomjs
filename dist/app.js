'use strict';

var middleware = function () {
    var _ref = _asyncToGenerator(function* (opts) {
        yield require('./grpc/index').init(opts);
    });

    return function middleware(_x) {
        return _ref.apply(this, arguments);
    };
}();

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

var _pomjsDingtalk = require('pomjs-dingtalk');

var _pomjsDingtalk2 = _interopRequireDefault(_pomjsDingtalk);

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
    app.use(new _koaCsrf2.default({
        invalidSessionSecretMessage: 'Invalid session secret',
        invalidSessionSecretStatusCode: 403,
        invalidTokenMessage: 'Invalid CSRF token',
        invalidTokenStatusCode: 403,
        excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
        disableQuery: false
    }));

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

    app.use((0, _error2.default)());
    app.use((0, _http2.default)());
    app.use((0, _bundle2.default)());
    //app.use(user());
    app.use((0, _route2.default)(opts));
    app.use((0, _render2.default)(opts));
    var port = opts.port || 3000;
    app.listen(port);
    console.log('listening on ', port);
};