import { set } from 'lodash'
import Debug from 'debug'
import path from 'path'

const debug = Debug('pomjs:config')

const getRoot = config => {
  if (!config.root) {
    const index = __dirname.indexOf('node_modules')
    if (index > -1) {
      return __dirname.substring(0, index)
    }
    throw new Error('root must be set')
  }
  return config.root
}

export default function getConf (config = {}) {
  config = Object.assign({}, config)
  config.root = getRoot(config)
  config.staticPath = config.staticPath || path.join(config.root, 'static')

  process.env = Object.assign(process.env, config)

  for (const arg of Object.keys(process.env)) {
    if (arg.startsWith('pomjs_')) {
      const configPath = arg.replace('pomjs_', '').replace('_', '.', 'g')
      set(config, configPath, process.env[arg])
      debug(`merge env to config.${configPath}: ${process.env[arg]}`)
    }
  }

  return config
}
