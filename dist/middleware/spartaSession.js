'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function () {
    var _ref = _asyncToGenerator(function* (ctx, next) {
      if (ctx.session.isNew) {
        ctx.state._sessionExpired = true;

        var loginCookieParam = {
          signed: false,
          httpOnly: false,
          path: '/',
          maxAge: 0,
          domain: opts.auth.domain || 'localhost'
        };

        ctx.cookies.set('pToken', null, loginCookieParam);
        ctx.cookies.set('userId', null, loginCookieParam);
        ctx.cookies.set('companyId', null, loginCookieParam);
        ctx.cookies.set('accountId', null, loginCookieParam);
        ctx.cookies.set('language', null, loginCookieParam);
        ctx.cookies.set('setting_ouId', null, loginCookieParam);
      }

      yield next();
    });

    return function (_x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
};