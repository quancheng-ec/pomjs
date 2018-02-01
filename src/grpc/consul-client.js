const Bluebird = require('bluebird')
const consul = require('consul')
const debug = require('debug')('pomjs:consul-client')

function fromCallback(fn) {
  return new Bluebird((resolve, reject) => {
    try {
      return fn((err, data, res) => {
        if (err) {
          err.res = res
          return reject(err)
        }
        return resolve([data, res])
      })
    } catch (err) {
      return reject(err)
    }
  })
}

function findNode(group) {
  return serviceNode => {
    const { ID, Address, Port } = serviceNode.Service
    const [host, name, version] = ID.split('-')

    return {
      name,
      host,
      address: Address,
      port: Port,
      version,
      group
    }
  }
}

let consulClient

const services = {}

const init = opts => {
  const saluki = opts.saluki || {}

  consulClient = consul({
    promisify: fromCallback,
    host: saluki.host || '127.0.0.1',
    port: saluki.port || '8500'
  })

  return consulClient
}

const handleServiceCheck = group => data => {
  const _services = {}

  data.forEach(n => {
    const service = findNode(group)(n)
    debug('service: %o', service)
    ;(_services[service.name] || (_services[service.name] = [])).push(service)
  })

  services[group] = _services
}

const watchService = group => {
  const serviceName = `saluki_${group}`
  const watcher = consulClient
    .watch({
      method: consulClient.health.service,
      options: {
        service: serviceName,
        passing: true
      }
    })
    .on('change', data => {
      console.log('%s on consul has changed on %s', serviceName, new Date())
      handleServiceCheck(group)(data)
    })
    .on('error', err => {
      console.log('watch service %s on consul error:', serviceName, err)
    })
}

module.exports = exports = {
  init,
  watchService,
  getALL() {
    return services
  },
  getService(api) {
    if (services[api.group]) {
      return services[api.group][api.name] || []
    }
    return null
  }
}
