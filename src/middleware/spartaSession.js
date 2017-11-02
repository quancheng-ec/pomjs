module.exports = (opts = {}) => {
  return async (ctx, next) => {
    const loginCookieParam = {
      signed: false,
      httpOnly: false,
      path: '/',
      maxAge: 0,
      domain: opts.auth.domain || 'localhost'
    }
    const previousTimestamp = ctx.cookies.get('spartaRollingTimestamp')

    if (previousTimestamp && opts.sparta.rollingLogin) {
      console.log('')
      console.log('current time', Date.now())
      console.log('previous time', previousTimestamp)
      console.log('rolling period', opts.sparta.rollingLoginPeriod)
      console.log('isseued for', Date.now() - previousTimestamp)
      console.log('')
      if (Date.now() - previousTimestamp < opts.sparta.rollingLoginPeriod) {
        ctx.cookies.set('spartaRollingTimestamp', Date.now(), loginCookieParam)
      } else {
        ctx.state._isAuthExpired = true
        // do logout
        ctx.cookies.set('spartaRollingTimestamp', null, loginCookieParam)
        ctx.cookies.set('pToken', null, loginCookieParam)
        ctx.cookies.set('userId', null, loginCookieParam)
        ctx.cookies.set('companyId', null, loginCookieParam)
        ctx.cookies.set('accountId', null, loginCookieParam)
        ctx.cookies.set('language', null, loginCookieParam)
        ctx.cookies.set('setting_ouId', null, loginCookieParam)
      }
    }

    await next()
  }
}
