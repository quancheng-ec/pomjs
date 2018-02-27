import path from 'path'

const pathRegex = /^\/((api|event)\/)?(\w+)(\/(\w+))?$/

const getController = returnType => async (page, method) => {
  // return rendered view
  if (returnType === 'view') {
    return
  }

  // return restful api json
  if (!method) {
    method = page
    page = 'index'
  }
}

export default function (conf) {
  const pageDir = conf.isProduction ? conf.page.build : conf.page.src

  return async function router (ctx, next) {
    const reqPath = ctx.path
    if (reqPath === '/' || reqPath === '') {
      await getController('view')('index', 'view')
    } else {
      const parsedPath = reqPath.match(pathRegex)
      if (!parsedPath) ctx.throw(404)
      const [, , returnType = 'view', controller, , method] = parsedPath
      await getController(returnType)(controller, method)
    }

    await next()
  }
}
