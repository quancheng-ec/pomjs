import Saluki2Client from '@quancheng/saluki2-node'

export default function (opts) {
  const client = new Saluki2Client(opts)
  client.init()
  return async (ctx, next) => {
    ctx.services = client.services
    await next()
  }
}