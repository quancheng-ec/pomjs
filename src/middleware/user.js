/**
 *
 * 用户服务，接收用户登陆、注册
 *
 * Created by joe on 16/10/16.
 */
//import uid from "uid-safe";

//const sidKey = 'JSESSIONID';
const pathToRegexp = require('path-to-regexp')

module.exports = function(opts = {}) {
  const auth = opts.auth || {}
  let pathRegexps = []
  if (auth.regexps) {
    auth.regexps.forEach(path => {
      pathRegexps.push(pathToRegexp(path, []))
    })
  }
  return async function user(ctx, next) {
    init(ctx)
    if (
      !auth.skip &&
      (ctx.state._isAuthExpired ||
        (!ctx.response.header.token && pathRegexps.length > 0))
    ) {
      for (let i = 0; i < pathRegexps.length; i++) {
        let re = pathRegexps[i]
        const rs = re.exec(ctx.originalUrl)
        if (rs) {
          await next()
          return
        }
      }
      // 没有命中白名单，进行登陆页面跳转
      const target = encodeURIComponent(ctx.href).replace(
        'http',
        opts.protocol || 'http'
      )
      //let url = ctx.querystring ? auth.loginUrl + '&' : auth.loginUrl + '?';
      //url += 'target=' + target;
      let url = auth.loginUrl + '?target=' + target
      ctx.redirect(url)
      return
    }

    await next()
  }
}
/**
 * 初始化 登陆信息，放到header里面
 * @param ctx
 */
function init(ctx) {
  let token = ctx.cookies.get('pToken') || ctx.request.header.token
  if (token) {
    ctx.response.append('token', token)
    ctx.request.header.token = token
  }
  let userId = ctx.cookies.get('userId') || ctx.request.header.userid
  if (userId) {
    ctx.response.append('userid', userId)
    ctx.request.header.userid = userId
  }
  let accountId = ctx.cookies.get('accountId') || ctx.request.header.accountid
  if (accountId) {
    ctx.response.append('accountid', accountId)
    ctx.request.header.accountid = accountId
  }
  let companyId = ctx.cookies.get('companyId') || ctx.request.header.companyid
  if (companyId) {
    ctx.response.append('companyid', companyId)
    ctx.request.header.companyid = companyId
  }
  ctx.user = {
    companyid: companyId,
    accountid: accountId,
    userid: userId,
    language: ctx.cookies.get('language') || 'zh'
  }
}
