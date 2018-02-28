'use strict';

var _bluebird = require('bluebird');

/**
 *
 * 用户服务，接收用户登陆、注册
 *
 * Created by joe on 16/10/16.
 */
//import uid from "uid-safe";

//const sidKey = 'JSESSIONID';
var pathToRegexp = require('path-to-regexp');

module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var auth = opts.auth || {};
  var pathRegexps = [];
  if (auth.regexps) {
    auth.regexps.forEach(function (path) {
      pathRegexps.push(pathToRegexp(path, []));
    });
  }
  return function () {
    var _ref = (0, _bluebird.coroutine)(function* (ctx, next) {
      init(ctx);
      if (!auth.skip && (ctx.state._isAuthExpired || !ctx.response.header.token && pathRegexps.length > 0)) {
        for (var i = 0; i < pathRegexps.length; i++) {
          var re = pathRegexps[i];
          var rs = re.exec(ctx.originalUrl);
          if (rs) {
            yield next();
            return;
          }
        }
        // 没有命中白名单，进行登陆页面跳转
        var target = encodeURIComponent(ctx.href).replace('http', opts.protocol || 'http');
        //let url = ctx.querystring ? auth.loginUrl + '&' : auth.loginUrl + '?';
        //url += 'target=' + target;
        var url = auth.loginUrl + '?target=' + target;
        ctx.redirect(url);
        return;
      }

      yield next();
    });

    function user(_x2, _x3) {
      return _ref.apply(this, arguments);
    }

    return user;
  }();
};
/**
 * 初始化 登陆信息，放到header里面
 * @param ctx
 */
function init(ctx) {
  var token = ctx.cookies.get('pToken') || ctx.request.header.token;
  if (token) {
    ctx.response.append('token', token);
    ctx.request.header.token = token;
  }
  var userId = ctx.cookies.get('userId') || ctx.request.header.userid;
  if (userId) {
    ctx.response.append('userid', userId);
    ctx.request.header.userid = userId;
  }
  var accountId = ctx.cookies.get('accountId') || ctx.request.header.accountid;
  if (accountId) {
    ctx.response.append('accountid', accountId);
    ctx.request.header.accountid = accountId;
  }
  var companyId = ctx.cookies.get('companyId') || ctx.request.header.companyid;
  if (companyId) {
    ctx.response.append('companyid', companyId);
    ctx.request.header.companyid = companyId;
  }
  ctx.user = {
    companyid: companyId,
    accountid: accountId,
    userid: userId,
    language: ctx.cookies.get('language') || 'zh'
  };
}