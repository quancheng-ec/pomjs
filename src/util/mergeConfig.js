const { set } = require('lodash')
const debug = require('debug')('pomjs:config')

module.exports = config => {
  config = Object.assign({}, config)
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
