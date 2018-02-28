"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require("bluebird");

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  return function () {
    var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {
      ctx.cache = opts.cache;
      yield next();
    });

    function setCache(_x2, _x3) {
      return _ref.apply(this, arguments);
    }

    return setCache;
  }();
};