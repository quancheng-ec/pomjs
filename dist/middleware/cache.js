"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  return function () {
    var _ref = _asyncToGenerator(function* (ctx, next) {
      ctx.cache = opts.cache;
      yield next();
    });

    function setCache(_x2, _x3) {
      return _ref.apply(this, arguments);
    }

    return setCache;
  }();
};

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * 缓存模块
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */