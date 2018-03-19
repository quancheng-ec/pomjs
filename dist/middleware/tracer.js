'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function () {
    var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {
      ctx.tracer = {
        id: ctx.req.headers['qc-logid'] || (0, _v2.default)()
      };
      yield next();
    });

    return function (_x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
};

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }