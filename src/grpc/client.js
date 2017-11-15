/**
 * Created by joe on 2016/10/22.
 */

const Path = require('path')
const FS = require('fs')
const grpc = require('grpc')
const glob = require('glob')
const _ = require('lodash')
const consul = require('./consul')
const debug = require('debug')('pomjs-grpc')

var grpcOptions = {
  'grpc.ssl_target_name_override': 'grpc',
  'grpc.default_authority': 'grpc'
}

let metadataUpdater = function(service_url, callback) {
  var metadata = new grpc.Metadata()
  metadata.set('plugin_key', 'plugin_value')
  callback(null, metadata)
}

let ssl_creds, creds, mcreds, combined_creds

let protos = {}

function loadPem() {
  const pem = Path.join(__dirname, '../../server.pem')
  console.log('load ' + pem)
  ssl_creds = grpc.credentials.createSsl(FS.readFileSync(pem))
  creds = grpc.credentials.createInsecure()
  mcreds = grpc.credentials.createFromMetadataGenerator(metadataUpdater)
  combined_creds = grpc.credentials.combineChannelCredentials(ssl_creds, mcreds)
}

async function initClient(saluki) {
  console.log('init saluki client!')
  loadPem()
  const root = saluki.root //'/Users/joe/work/service-all/api/src/main/proto/';
  glob.sync(Path.join(root, '**/*_service.proto')).forEach(function(f) {
    const proto = grpc.load({ root: root, file: f.substring(root.length) })
    protos = _.defaultsDeep(protos, proto)
  })

  const apis = {}
  const groups = {}
  for (let i in saluki.services) {
    const serviceDef = saluki.services[i]
    const ss = serviceDef.split('@')
    const sds = ss[0].split(':')
    const api = {}

    if (ss[1]) {
      api.target = ss[1]
    }
    if (sds.length === 3) {
      // name:group:version
      api.name = sds[0]
      api.group = sds[1]
      api.version = sds[2]
    } else if (sds.length === 2) {
      // name:version
      api.name = sds[0]
      api.group = saluki.salukiGroup || 'default'
      api.version = sds[1]
    } else if (sds.length === 1) {
      // name
      api.name = sds[0]
      api.group = saluki.salukiGroup || 'default'
      api.version = '1.0.0'
    }
    const names = api.name.split('.')
    let instances = protos
    names.forEach(function(n) {
      instances = !instances ? null : instances[n]
    })
    if (!instances) {
      console.error('the proto not found', serviceDef)
      continue
    }
    api.methods = {}
    api._grpc = instances
    api._clientPool = {}
    apis[i] = wrapService(api)
    groups[api.group] = true
  }
  await initConsuls(groups)
  return apis
}

/**
 * 初始化Consul配置
 * @param apis
 */
async function initConsuls(groups) {
  for (let i in groups) {
    await consul.initWidthGroup(i)
  }
}

/**
 * 获取api对应的grpc的连接
 * @param api
 * @returns {*}
 */
function getClient(api, index) {
  // if (api.target) {
  //   if (api.client) {
  //     return api.client;
  //   }
  //   const client = new api._grpc(api.target, combined_creds, grpcOptions);
  //   api.client = client;
  //   return api.client;
  // }

  const provider = consul.getService(api)
  if (!provider) {
    console.error('the service provider not found', api.name)
    return null
  }

  const providerHosts = []
  provider.forEach(function(s) {
    //匹配provide和当前的service声明，如果相同则记录下来
    if ((s.group || 'default') === api.group && (s.version || '1.0.0') === api.version) {
      providerHosts.push(s.host)
    }
  })
  if (providerHosts.length === 0) {
    console.error('the service provider not found', api, 'please check saluki service config')
    return null
  }
  //如果有重试行为，清除 client连接缓存
  if (index) {
    //loadPem();
    for (const ip in api._clientPool) {
      if (api._clientPool.hasOwnProperty(ip)) {
        grpc.closeClient(api._clientPool[ip])
      }
    }
    api._clientPool = {}
  }
  const pool = api._clientPool
  const host = randomLoadbalancer(providerHosts)
  if (pool[host]) {
    return pool[host]
  }
  const client = new api._grpc(host, combined_creds, grpcOptions)
  pool[host] = client
  client._host = host
  return client
}

function wrapService(api) {
  const methods = api._grpc.service.children
  const service = {}
  methods.forEach(function(ins) {
    service[ins.name] = promising(api, ins.name)
  })
  return service
}

function promising(api, name) {
  const invoke = function(req, metadata, callback, resolve, reject, index) {
    const customeMetadata = new grpc.Metadata()
    let client = getClient(api, index)
    Object.keys(metadata).forEach(k => customeMetadata.set(k, metadata[k]))
    debug(`request api: ${api}`)
    debug(`request body data: ${req}`)
    debug(`request metada: ${metadata}`)
    client[name](req, metadata, function(err, resp) {
      if (err) {
        const reqstr = JSON.stringify(req)
        console.error(client._host, api.name, name, reqstr, err, index || 0)
        //如果有网络错误重试五次
        if (err.code && index < 3) {
          index++
          invoke(req, callback, resolve, reject, index)
          return
        }
        if (!err.message) {
          err.message = 'grpc invoke error:' + api.name + '.' + name + reqstr
        }
        reject(err)
      } else {
        resolve(
          _.extend(resp, {
            _get(path, defaultVal) {
              return _.get(resp, path, defaultVal)
            }
          })
        )
      }
      if (callback) {
        callback(err, resp)
      }
    })
  }

  return function(req, metadata = {}, callback) {
    let index = 0
    return new Promise(function(resolve, reject) {
      invoke(req, metadata, callback, resolve, reject, index)
    })
  }
}

function randomLoadbalancer(providerHosts) {
  const index = getRandomIntInclusive(0, providerHosts.length - 1)
  const host = providerHosts[index]
  //var client = new instances(si, grpc.credentials.createInsecure());
  return host
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
  init: initClient,
  grpcOptions: grpcOptions
}
