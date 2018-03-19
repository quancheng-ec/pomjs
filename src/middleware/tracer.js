import uuidV4 from 'uuid/v4'

export default function(opts = {}) {
  return async (ctx, next) => {
    ctx.tracer = {
      id: ctx.req.headers['qc-logid'] || uuidV4()
    }
    await next()
  }
}
