'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var layouts = opts.layouts || Path.join(opts.root, 'layouts');
  if (!opts.isProduction) {
    pageLoader.initCompile(opts);
  }

  return function () {
    var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {
      if (!ctx.context) {
        yield next();
        return;
      }

      var timer = new ctx.logger.Timer({
        group: 'render'
      });

      var pageContext = ctx.context.pageContext;

      var body = _fs2.default.readFileSync(Path.join(layouts, ctx.context.layout || 'default.html')).toString();

      var chunkNames = ['manifest', 'vendor', 'common', pageContext.pageName];

      var sr = chunkNames.map(function (c) {
        var cPath = pageLoader.getClientFilePath(c + '.bundle.js');
        if (!cPath) return '';
        return '<script src="' + (opts.cdndomain || '') + cPath + '"></script>';
      }).join('\n');

      var css = chunkNames.map(function (c) {
        if (process.env.NODE_ENV === 'production') {
          var _cPath = pageLoader.getClientFilePath(c + '.style.css');
          if (!_cPath) return '';
          return '<link \n            href="' + (opts.cdndomain || '') + _cPath + '" rel=\'stylesheet\'>\n          </link>';
        }
        var cPath = pageLoader.readClientFile(c + '.style.css');
        if (!cPath) return '';
        return cPath.toString();
      }).join('\n');

      var contextData = '<script>\n      var __vue_context_data=' + JSON.stringify(ctx.context) + '\n    </script>';

      if (process.env.NODE_ENV !== 'production') {
        yield pageLoader.compileRun();
      }

      var html = yield renderPromise(pageContext.pageName + '.bundle.js', pageLoader.readServerFileSync(pageContext.pageName + '.bundle.js'), ctx.context);

      var insertRaven = function insertRaven(sdn) {
        if (!sdn) return '';
        return '\n      <script src="//qc-style.oss-cn-hangzhou.aliyuncs.com/raven/3.22.2/raven.min.js"></script>\n      <script src="/assets/cyclops.js"></script>\n      <script>\n          Raven.config(\'' + sdn + '\').install()\n          var c = new Cyclops({\n              performance: {\n                  max_duration: 5000\n              }\n          })\n          c.start()\n      </script>\n      ';
      };

      _lodash2.default.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
      ctx.body = _lodash2.default.template(body)({
        raven: opts.raven ? insertRaven(opts.raven.sdn) : '',
        title: ctx.context.title || 'hello pomjs!',
        keywords: ctx.context.keywords || '',
        description: ctx.context.description || '',
        page: contextData + sr,
        html: html,
        stylesheet: process.env.NODE_ENV === 'production' ? css : '<style rel=\'stylesheet\'>' + css + '</style>'
      });

      ctx.type = 'text/html; charset=utf-8';

      timer.split();
    });

    function render(_x2, _x3) {
      return _ref.apply(this, arguments);
    }

    return render;
  }();
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by joe on 16/9/23.
 */

var Path = require('path');
var renderer = require('vue-server-renderer').createRenderer();
var createBundleRenderer = require('vue-server-renderer').createBundleRenderer;
var cache = {};
var pageLoader = require('../util/pageLoader');

var renderPromise = function renderPromise(pageName, code, context) {
  return new Promise(function (resolve, reject) {
    var cr = cache[pageName];
    if (!cr || !pageLoader.isProduction()) {
      cr = createBundleRenderer(code);
      cache[pageName] = cr;
    }
    cr.renderToString(context, function (err, html) {
      if (err) return reject(err);
      resolve(html);
    });
  });
};