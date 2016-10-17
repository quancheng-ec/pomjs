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
var _isProduction = process.env.NODE_ENV === 'production';
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
var webpackCompileRun = function webpackCompileRun(compile, cb) {
    return new Promise(function (resolve, reject) {
        compile.run(function (err, stats) {

            if (cb) {
                cb();
            }
            if (err) {
                console.error(err);
                return reject(err);
            }
            console.log(stats.toString({
                chunks: false, // Makes the build much quieter
                colors: true
            }));
            resolve(stats);
        });
    });
};
function doCompileAsync(serverCompiler, isServer, cb) {
    webpackCompileRun(serverCompiler, cb).then(function (f) {
        if (isServer) {
            serverStats = f;
        } else {
            clientStats = f;
        }
    }).catch(function (error) {
        console.error(error);
    });
}

var find = function find(f) {
    var api = Path.join(f, 'index.js');
    if (!_isProduction) {
        delete require.cache[api];
    }
    apis[api] = new (require(api).default)();

    if (api.indexOf('src/pages') !== -1) {
        return;
    }

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
        if (FS.existsSync(f)) {
            try {
                FS.unlinkSync(f);
            } catch (e) {}
        }
    });
    temps = [];
}

module.exports = {

    init: function init(opts) {
        pageDir = opts.page || Path.join(opts.root, 'pages');
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
        if (!apis[name] || !apis[name][action] || process.env.NODE_ENV !== 'production') {
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
        }
    },
    compileRun: function () {
        var _ref = _asyncToGenerator(function* () {
            serverStats = yield webpackCompileRun(serverCompiler);
            clientStats = yield webpackCompileRun(clientCompiler, function () {
                clear();
            });
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
        var p = serverStats.compilation.assets[pageName].existsAt;
        return (_isProduction ? FS : serverFs).readFileSync(p, 'utf8');
    },
    readClientFile: function readClientFile(pageName) {
        var p = clientStats.compilation.assets[pageName].existsAt;
        return clientFs.readFileSync(p);
    },
    getClientFilePath: function getClientFilePath(pageName) {
        return clientStats.compilation.assets[pageName].existsAt;
    }
};