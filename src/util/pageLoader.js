/**
 * Created by joe on 2016/10/13.
 */

const glob = require('glob')
const FS = require('fs')
const fs = require('fs-sync')
const webpack = require('webpack')
const MemoryFS = require('memory-fs')
const serverFs = new MemoryFS()
const clientFs = new MemoryFS() // require('fs');

const clientConfig = require('../../webpack.config')
const serverConfig = require('../../webpack.server.config')

const Path = require('path')
const apis = {}
var pageDir, staticDir, serverStats, clientStats, serverCompiler, clientCompiler
var isProduction = false // process.env.NODE_ENV === 'production';
// 缓存文件
var temps = []

const serverEntry = {}
const clientEntry = {}

/**
 * 执行webpack编译
 * @param compile
 * @param cb
 * @returns {Promise}
 */
const webpackCompileRun = function(tag, compile, cb) {
  return new Promise(function(resolve, reject) {
    compile.run((err, stats) => {
      if (err) {
        console.error(err)
        return reject(err)
      }
      // console.log(tag, stats.toString({
      //     chunks: false, // Makes the build much quieter
      //     colors: true
      // }));
      resolve(stats)
      if (cb) {
        cb(stats)
      }
    })
  })
}

const find = function(f) {
  const api = Path.join(f, 'index.js')
  // 只有开发环境才会打开热更新逻辑，热更新会导致webstorm debug 失败，所以可以接受 DEBUG参数
  if (!isProduction && apis[api] && !process.env.DEBUG) {
    delete require.cache[api]
  }

  apis[api] = new (require(api)).default()

  const vue = Path.join(f, '.s.js')
  temps.push(vue)
  const dir = f.substring(0, f.length - 1)
  const pageName = dir.substring(dir.lastIndexOf('/') + 1)
  if (!fs.exists(vue)) {
    const serverEntry =
      process.env.serverEntry || Path.join(__dirname, '../../vue.js')
    fs.copy(serverEntry, vue)
  }
  serverEntry[pageName] = vue

  const c = Path.join(f, '.c.js')
  temps.push(c)
  if (!fs.exists(c)) {
    const clientEntry =
      process.env.clientEntry || Path.join(__dirname, '../../client.js')
    fs.copy(clientEntry, c)
  }
  clientEntry[pageName] = c
}

/**
 * 清除临时文件
 */
function clear() {
  temps.forEach(function(f) {
    if (fs.exists(f)) {
      fs.remove(f)
    }
  })
  temps = []
}

let root = ''
let vueBuildPath
let build

let clientBuildAssets = {}

module.exports = {
  init: function(opts) {
    root = opts.root

    opts.page = {
      src: Path.join(opts.src, 'pages'),
      build: Path.join(opts.build, 'pages')
    }

    if (opts.isProduction) {
      isProduction = true
      vueBuildPath = Path.join(root, 'vue_build.json')
      if (fs.exists(vueBuildPath)) {
        build = require(vueBuildPath)
      }
    }
    pageDir = isProduction ? opts.page.build : opts.page.src // || Path.join(opts.root, 'pages');
    staticDir = opts.static || Path.join(root, 'static')
    module.exports.initPage()
  },
  getPageDir: function() {
    return pageDir
  },
  // 查找page目录
  initPage: function() {
    glob.sync(Path.join(pageDir, '*/')).forEach(find)
    glob.sync(Path.join(__dirname, '../pages/*/')).forEach(find)
  },
  getAPI: function(name, action) {
    if (!apis[name] || !apis[name][action] || !isProduction) {
      module.exports.initPage()
    }
    const api = apis[name]
    if (api && api[action]) {
      return api[action].bind(api)
    }
    return null
  },
  initCompile: function(opts) {
    serverConfig.entry = serverEntry
    serverConfig.output.path = Path.join(staticDir, '../bundle')

    clientConfig.entry = Object.assign(clientConfig.entry, clientEntry)
    clientConfig.entry.vendor = clientConfig.entry.vendor.concat(opts.vendor)
    clientConfig.output.path = Path.join(staticDir, 'bundle')

    serverCompiler = webpack(serverConfig)
    clientCompiler = webpack(clientConfig)

    if (!isProduction) {
      serverCompiler.outputFileSystem = serverFs
      clientCompiler.outputFileSystem = clientFs
      fs.remove(clientConfig.output.path)
    }
  },
  compileRun: async function(cb) {
    serverStats = await webpackCompileRun('server build:', serverCompiler)
    clientStats = await webpackCompileRun(
      'client build:',
      clientCompiler,
      function(stats) {
        clear()
        if (cb) {
          cb(stats)
        }
      }
    )
    for (let i in clientStats.compilation.assets) {
      const is = i.split('.')
      let name = i
      if (is.length > 3) {
        is.splice(1, 1)
        name = is.join('.')
      }
      clientBuildAssets[name] = clientStats.compilation.assets[i].existsAt
      if (isProduction) {
        clientBuildAssets[name] = clientBuildAssets[name].substring(
          staticDir.length
        )
      }
    }
    if (isProduction) {
      if (fs.exists(vueBuildPath)) {
        fs.remove(vueBuildPath)
      }
      const s = {}
      for (let i in serverStats.compilation.assets) {
        s[i] = serverStats.compilation.assets[i].existsAt
        s[i] = s[i].substring(root.length)
      }
      const j = { server: s, client: clientBuildAssets }
      const js = JSON.stringify(j)
      fs.write(vueBuildPath, js)
    }
  },
  isProduction: function() {
    return isProduction
  },
  readServerFileSync: function(pageName) {
    const rootPath = Path.resolve(staticDir, '../')
    const p = isProduction
      ? Path.resolve(rootPath, build.server[pageName])
      : serverStats.compilation.assets[pageName].existsAt
    return isProduction ? p : serverFs.readFileSync(p, 'utf8')
  },
  readClientFile: function(pageName) {
    const rootPath = Path.resolve(staticDir, '../')
    const p = isProduction
      ? Path.resolve(rootPath, build.client[pageName])
      : clientBuildAssets[pageName]
    return p ? clientFs.readFileSync(p) : ''
  },
  getClientFilePath: function(pageName) {
    const rootPath = Path.resolve(staticDir, '../')
    const p = isProduction
      ? Path.resolve(rootPath, build.client[pageName])
      : '/bundle/' + pageName
    return p
  }
}
