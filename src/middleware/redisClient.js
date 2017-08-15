import redis from 'redis'

export default function (opts) {
  const client = opts.redis ? redis.createClient(opts.redis) : null

  return async (ctx, next) => {
    if (client) ctx.redisClient = client
    await next()
  }
}