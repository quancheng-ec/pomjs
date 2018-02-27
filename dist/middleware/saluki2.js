'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app, opts) {
  var client = new _qccostSaluki2Node2.default(opts);
  client.init();
  app.services = client.services;
  return function () {
    var _ref = _asyncToGenerator(function* (ctx, next) {
      ctx.services = client.services;
      yield next();
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
};

var _qccostSaluki2Node = require('qccost-saluki2-node');

var _qccostSaluki2Node2 = _interopRequireDefault(_qccostSaluki2Node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }