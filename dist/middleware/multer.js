"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require("bluebird");

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function () {
    var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {
      // parse only content-type starts with multipart
      if (ctx.request.header["content-type"] && ctx.request.header["content-type"].startsWith('multipart/')) {
        var uploader = (0, _koaMulter2.default)(opts);
        try {
          var mid = uploader.any();
          yield mid(ctx, next);
        } catch (e) {
          ctx.throw(400, e.message);
        }
        return;
      }
      yield next();
    });

    function multer(_x2, _x3) {
      return _ref.apply(this, arguments);
    }

    return multer;
  }();
};

var _koaMulter = require("koa-multer");

var _koaMulter2 = _interopRequireDefault(_koaMulter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }