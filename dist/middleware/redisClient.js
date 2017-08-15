'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (opts) {
  var client = opts.redis ? _redis2.default.createClient(opts.redis) : null;

  return function () {
    var _ref = _asyncToGenerator(function* (ctx, next) {
      if (client) ctx.redisClient = client;
      yield next();
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
};

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }