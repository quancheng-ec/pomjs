import redis from 'redis'

export default function (opts) {
  const client = redis.createClient(opts.redis)

  return async (ctx, next) => {
    ctx.redisClient = client
    await next()
  }
}