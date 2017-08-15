/**
 * 心跳检测中间件
 * author Zephyr 
 */
import { consulClient } from '../grpc/consul'

const MESSAGES = {
  NO_SALUKI_CONF: 'No saluki configuration',
  SALUKI_CHECK_FAILED: 'Saluki Health Check Failed'
}

const DEFAULT_HEALTHCHECK_URL = '/api/healthCheck'
const SALUKI_HEALTHY_STATUS = 'SERVING'

const makeRespond = ctx => (code, message) => {
  ctx.status = code
  ctx.body = {
    isHealth: code < 400,
    message
  }
}


export default opts => {
  let { healthCheckUrl } = opts
  return async (ctx, next) => {
    const respond = makeRespond(ctx)
    // no saluki config, pass
    if (!opts.saluki) {
      respond(200, MESSAGES.NO_SALUKI_CONF)
    }

    // if hitting healthCheck path
    // check saluki service health check
    healthCheckUrl = healthCheckUrl || DEFAULT_HEALTHCHECK_URL
    if (ctx.path === healthCheckUrl) {

      try {

        await Promise.all(opts.saluki.group.map(group => consulClient().health.service({
          service: `saluki_${group}`,
          passing: true
        })))

        respond(200)

      } catch (e) {
        respond(500, e.message)
      }

      return
    }
    await next()
  }
}