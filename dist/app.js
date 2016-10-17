'use strict';

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

var _user = require('./middleware/user');

var _user2 = _interopRequireDefault(_user);

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

    app.use(convert(serve(staticPath, { maxage: 60 * 60 * 24 * 365 })));
    // set the session keys
    app.keys = ['qc'];
    // add session support
    app.use((0, _koaSession2.default)({
        key: "SESSIONID" //default "koa:sess"
    }));

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
        var _ref = _asyncToGenerator(function* (ctx, next) {
            var start = new Date();
            yield next();
            var ms = new Date() - start;
            ctx.set('X-Response-Time', ms + 'ms');
        });

        return function (_x2, _x3) {
            return _ref.apply(this, arguments);
        };
    }());

    app.use((0, _error2.default)());
    app.use((0, _http2.default)());
    app.use((0, _bundle2.default)());
    //app.use(user());
    app.use((0, _route2.default)(opts));
    app.use((0, _render2.default)(opts));

    app.listen(3000);
};