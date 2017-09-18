'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function () {
    var _ref = _asyncToGenerator(function* (ctx, next) {

      var loginCookieParam = {
        signed: false,
        httpOnly: false,
        path: '/',
        maxAge: 0,
        domain: opts.auth.domain || 'localhost'
      };
      var previousTimestamp = ctx.cookies.get('spartaRollingTimestamp');

      if (previousTimestamp && opts.sparta.rollingLogin) {
        console.log('');
        console.log('current time', Date.now());
        console.log('previous time', previousTimestamp);
        console.log('rolling period', opts.sparta.rollingLoginPeriod);
        console.log('isseued for', Date.now() - previousTimestamp);
        console.log('');
        if (Date.now() - previousTimestamp < opts.sparta.rollingLoginPeriod) {
          ctx.cookies.set('spartaRollingTimestamp', Date.now(), loginCookieParam);
        } else {
          ctx.state._isAuthExpired = true;
          // do logout
          ctx.cookies.set('spartaRollingTimestamp', null, loginCookieParam);
          ctx.cookies.set('pToken', null, loginCookieParam);
          ctx.cookies.set('userId', null, loginCookieParam);
          ctx.cookies.set('companyId', null, loginCookieParam);
          ctx.cookies.set('accountId', null, loginCookieParam);
          ctx.cookies.set('language', null, loginCookieParam);
          ctx.cookies.set('setting_ouId', null, loginCookieParam);
        }
      }

      yield next();
    });

    return function (_x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
};