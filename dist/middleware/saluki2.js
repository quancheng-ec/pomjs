'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

exports.default = function (app, opts) {
  var client = new _qccostSaluki2Node2.default(opts);
  client.init();
  app.services = client.services;
  return function () {
    var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {
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