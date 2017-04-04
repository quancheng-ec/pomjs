
const path = require('path')
const plugin = require('./index')();

/**
 * 自定义插件
 */

module.exports = function (options) {

  let plugins = options.plugins || [];
  plugin.loadPlugins(plugins, options);

  return null;

}