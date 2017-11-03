'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var fs = require('fs-extra');

var _require = require('path'),
    resolve = _require.resolve;

module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function () {
    var _ref = _asyncToGenerator(function* (ctx, next) {
      try {
        yield next();
      } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.type = 'html';
        ctx.body = yield fs.readFile(resolve(__dirname, '../../views/error.html'), 'utf8');
        if (ctx.status !== 404) {
          console.error(err);
        }
      }
    });

    function error(_x2, _x3) {
      return _ref.apply(this, arguments);
    }

    return error;
  }();
};