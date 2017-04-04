
const path = require('path');
const fs = require('fs');
const log4js = require('koa-log4');
const logger = log4js.getLogger('pomjs_plugin');

let app = {};


/**
  * 初始化
  * @param {*} _app 
  */
module.exports = function (_app) {
  if (_app) {
    app = _app;
  }

  return {
    plugins: [
      path.join(__dirname, 'static.js'),
      path.join(__dirname, 'wrap.js'),
      path.join(__dirname, 'session.js'),
      path.join(__dirname, 'cors.js'),
      path.join(__dirname, 'multer.js'),
      path.join(__dirname, 'bodyParser.js'),
      path.join(__dirname, 'csrf.js'),
      path.join(__dirname, 'error.js'),
      path.join(__dirname, 'custom.js'),
      path.join(__dirname, 'webpack/index.js')

    ],
    /**
     * 加载插件
     * @param {*} plugins 
     */
    loadPlugins(plugins, options) {
      plugins.forEach(plugin => {
        const pluginFs = fs.statSync(plugin);
        if (pluginFs && pluginFs.isFile()) {
          const pluginModule = require(plugin)(options, app);
          if (pluginModule) {
            app.use(pluginModule);
            logger.info('load the plugin', plugin);
          }
        } else {
          logger.info('the plugin is not exits', plugin);
        }
      });
    }
  };
};

