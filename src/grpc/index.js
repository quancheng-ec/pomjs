/**
 * Created by joe on 2016/10/23.
 */

const client = require('./client')
const consulClient = require('./consul-client')

const _apis = {}

module.exports = {
  init: async function(opts = {}) {
    if (!opts.saluki) {
      console.log('no saluki config,ignore this step!')
      return
    }
    opts.saluki.services = opts.saluki.services || {}
    consulClient.init(opts)

    //await consul.init(opts)
    Object.assign(_apis, await client.init(opts.saluki))
  },
  services: function() {
    return _apis
  },
  grpcOptions: client.grpcOptions
}
