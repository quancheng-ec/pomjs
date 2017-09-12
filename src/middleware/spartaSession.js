module.exports = (opts = {}) => {
  return async (ctx, next) => {
    if (ctx.session.isNew) {
      ctx.state._sessionExpired = true

      const loginCookieParam = {
        signed: false,
        httpOnly: false,
        path: '/',
        maxAge: 0,
        domain: opts.auth.domain || 'localhost'
      }

      ctx.cookies.set('pToken', null, loginCookieParam);
      ctx.cookies.set('userId', null, loginCookieParam);
      ctx.cookies.set('companyId', null, loginCookieParam);
      ctx.cookies.set('accountId', null, loginCookieParam);
      ctx.cookies.set('language', null, loginCookieParam);
      ctx.cookies.set('setting_ouId', null, loginCookieParam);
    }

    await next()
  }
}