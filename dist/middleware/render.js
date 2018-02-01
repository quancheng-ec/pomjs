'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var layouts = opts.layouts || Path.join(opts.root, 'layouts');
  if (!opts.isProduction) {
    pageLoader.initCompile(opts);
  }

  return function () {
    var _ref = _asyncToGenerator(function* (ctx, next) {
      if (!ctx.context) {
        yield next();
        return;
      }

      var timer = new ctx.logger.Timer({
        group: 'render'
      });

      var pageContext = ctx.context.pageContext;

      var body = _fs2.default.readFileSync(Path.join(layouts, ctx.context.layout || 'default.html')).toString();
      body = body.replace('{{ title }}', ctx.context.title || 'hello pomjs!');
      body = body.replace('{{ keywords }}', ctx.context.keywords || '');
      body = body.replace('{{ description }}', ctx.context.description || '');

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

      body = body.replace('{{ page.js }}', contextData + sr);

      if (process.env.NODE_ENV !== 'production') {
        yield pageLoader.compileRun();
      }

      var html = yield renderPromise(pageContext.pageName + '.bundle.js', pageLoader.readServerFileSync(pageContext.pageName + '.bundle.js'), ctx.context);

      body = body.replace('{{ html }}', html);

      body = body.replace('{{ stylesheet }}', process.env.NODE_ENV === 'production' ? css : '<style rel=\'stylesheet\'>' + css + '</style>');

      ctx.body = body;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
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