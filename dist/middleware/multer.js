"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function () {
    var _ref = _asyncToGenerator(function* (ctx, next) {
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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * FormData 解析中间件
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * dependencies: koa-multer
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * by Zephyr
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * 2016.11.27 21:40
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */