'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by joe on 2016/10/13.
 */

var glob = require("glob");
var FS = require('fs');
var fs = require('fs-sync');
var webpack = require('webpack');
var MemoryFS = require("memory-fs");
var serverFs = new MemoryFS();
var clientFs = new MemoryFS(); //require('fs');

var clientConfig = require('../../webpack.config');
var serverConfig = require('../../webpack.server.config');

var Path = require('path');
var apis = {};
var pageDir, staticDir, serverStats, clientStats, serverCompiler, clientCompiler;
var _isProduction = false; //process.env.NODE_ENV === 'production';
//缓存文件
var temps = [];

var serverEntry = {};
var clientEntry = {};

/**
 * 执行webpack编译
 * @param compile
 * @param cb
 * @returns {Promise}
 */
var webpackCompileRun = function webpackCompileRun(tag, compile, cb) {
    return new Promise(function (resolve, reject) {
        compile.run(function (err, stats) {
            if (err) {
                console.error(err);
                return reject(err);
            }
            console.log(tag, stats.toString({
                chunks: false, // Makes the build much quieter
                colors: true
            }));
            resolve(stats);
            if (cb) {
                cb(stats);
            }
        });
    });
};

var find = function find(f) {
    var api = Path.join(f, 'index.js');
    //只有开发环境才会打开热更新逻辑，热更新会导致webstorm debug 失败，所以可以接受 DEBUG参数
    if (!_isProduction && apis[api] && !process.env.DEBUG) {
        delete require.cache[api];
    }

    apis[api] = new (require(api).default)();

    var vue = Path.join(f, '.s');
    temps.push(vue);
    var dir = f.substring(0, f.length - 1);
    var pageName = dir.substring(dir.lastIndexOf('/') + 1);
    if (!fs.exists(vue)) {
        fs.copy(Path.join(__dirname, '../../vue.js'), vue);
    }
    serverEntry[pageName] = vue;

    var c = Path.join(f, '.c');
    temps.push(c);
    if (!fs.exists(c)) {
        fs.copy(Path.join(__dirname, '../../client.js'), c);
    }
    clientEntry[pageName] = c;
};

/**
 * 清除临时文件
 */
function clear() {
    temps.forEach(function (f) {
        if (fs.exists(f)) {
            fs.remove(f);
        }
    });
    temps = [];
}

var root = '';
var vue_build_path = void 0;
var build = void 0;

module.exports = {

    init: function init(opts) {
        root = opts.root;
        if (!opts.page) {
            throw new Error("the opts page can't be null");
        }
        if (opts.isProduction) {
            _isProduction = true;
            vue_build_path = Path.join(root, 'vue_build.json');
            if (fs.exists(vue_build_path)) {
                build = require(vue_build_path);
            }
        }
        pageDir = _isProduction ? opts.page.build : opts.page.src; //|| Path.join(opts.root, 'pages');
        staticDir = opts.static || Path.join(root, 'static');
        module.exports.initPage();
    },
    getPageDir: function getPageDir() {
        return pageDir;
    },
    //查找page目录
    initPage: function initPage() {
        glob.sync(Path.join(pageDir, "*/")).forEach(find);
        glob.sync(Path.join(__dirname, "../pages/*/")).forEach(find);
    },
    getAPI: function getAPI(name, action) {
        if (!apis[name] || !apis[name][action] || !_isProduction) {
            module.exports.initPage();
        }
        var api = apis[name];
        if (api && api[action]) {
            return api[action];
        }
        return null;
    },
    initCompile: function initCompile() {
        serverConfig.entry = serverEntry;
        serverConfig.output.path = Path.join(staticDir, '../bundle');

        clientConfig.entry = clientEntry;
        clientConfig.output.path = Path.join(staticDir, 'bundle');

        serverCompiler = webpack(serverConfig);
        clientCompiler = webpack(clientConfig);

        if (!_isProduction) {
            serverCompiler.outputFileSystem = serverFs;
            clientCompiler.outputFileSystem = clientFs;
            fs.remove(clientConfig.output.path);
        }
    },
    compileRun: function () {
        var _ref = _asyncToGenerator(function* () {
            serverStats = yield webpackCompileRun('server build:', serverCompiler);
            clientStats = yield webpackCompileRun('client build:', clientCompiler, function () {
                clear();
            });

            if (_isProduction) {
                if (fs.exists(vue_build_path)) {
                    fs.remove(vue_build_path);
                }
                var s = {};
                for (var i in serverStats.compilation.assets) {
                    s[i] = serverStats.compilation.assets[i].existsAt;
                    s[i] = s[i].substring(root.length);
                }
                var c = {};
                for (var _i in clientStats.compilation.assets) {
                    c[_i] = clientStats.compilation.assets[_i].existsAt;
                    c[_i] = c[_i].substring(root.length);
                }
                var j = { server: s, client: c };
                var js = JSON.stringify(j);
                fs.write(vue_build_path, js);
            }
        });

        function compileRun() {
            return _ref.apply(this, arguments);
        }

        return compileRun;
    }(),
    isProduction: function isProduction() {
        return _isProduction;
    },
    readServerFileSync: function readServerFileSync(pageName) {
        var rootPath = Path.resolve(staticDir, '../');
        var p = _isProduction ? Path.resolve(rootPath, build.server[pageName]) : serverStats.compilation.assets[pageName].existsAt;
        return (_isProduction ? FS : serverFs).readFileSync(p, 'utf8');
    },
    readClientFile: function readClientFile(pageName) {
        var rootPath = Path.resolve(staticDir, '../');
        var p = _isProduction ? Path.resolve(rootPath, build.client[pageName]) : clientStats.compilation.assets[pageName].existsAt;
        return clientFs.readFileSync(p);
    },
    getClientFilePath: function getClientFilePath(pageName) {
        return clientStats.compilation.assets[pageName].existsAt;
    }
};