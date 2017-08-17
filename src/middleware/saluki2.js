import Saluki2Client from '@quancheng/saluki2-node'

export default function (app, opts) {
  const client = new Saluki2Client(opts)
  client.init()
  app.services = client.services
  return async (ctx, next) => {
    ctx.services = client.services
    await next()
  }
}