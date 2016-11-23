'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    pageLoader.init(opts);
    var pageDir = opts.isProduction ? opts.page.build : opts.page.src;

    return function () {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            var reqPath = ctx.path,
                ext = "";

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
                context: context, pageContext: {
                    pagePath: pagePath,
                    pageName: pageName,
                    pageAction: action
                }, csrf: ctx.csrf
            });

            var result = yield control(ctx, services);

            if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) !== 'object') {
                var _e = new Error('the ' + api + ' result must be Object');
                _e.statusCode = 500;
                throw _e;
            }

            if (type === 'event') {
                return;
            }

            if (type === 'api') {
                ctx.body = result;
                return;
            }

            ctx.context = Object.assign(ctx.context, result);

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * 处理Route模块，并执行Control逻辑
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Created by joe on 16/9/23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var fetch = require('node-fetch');

var pageLoader = require('../util/pageLoader');

var DEFAULT_NAME = 'index.js';
var DEFAULT_FILE = 'index/index.js';

var services = require('../grpc/index').services();