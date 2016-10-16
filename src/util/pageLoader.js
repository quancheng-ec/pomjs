/**
 * Created by joe on 2016/10/13.
 */



const glob = require("glob");
const FS = require('fs');
const fs = require('fs-sync');
const webpack = require('webpack');
const MemoryFS = require("memory-fs");
const serverFs = new MemoryFS();
const clientFs = new MemoryFS();//require('fs');

const clientConfig = require('../../webpack.config');
const serverConfig = require('../../webpack.server.config');

const Path = require('path')
const apis = {};
var pageDir, staticDir, serverStats, clientStats, serverCompiler, clientCompiler;
var isProduction = process.env.NODE_ENV === 'production';
//缓存文件
var temps = [];

const serverEntry = {};
const clientEntry = {};

/**
 * 执行webpack编译
 * @param compile
 * @param cb
 * @returns {Promise}
 */
const webpackCompileRun = function (compile, cb) {
    return new Promise(function (resolve, reject) {
        compile.run((err, stats) => {

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
/**
 * 清楚临时文件
 */
function clear() {
    temps.forEach(function (f) {
        if (FS.existsSync(f)) {
            try {
                FS.unlinkSync(f);
            } catch (e) {
            }
        }
    });
    temps = [];
}

module.exports = {

    init: function (opts) {
        pageDir = opts.page || Path.join(opts.root, 'pages');
        staticDir = opts.static || Path.join(root, 'static');
        module.exports.initPage();
    },
    getPageDir: function () {
        return pageDir;
    },
    //查找page目录
    initPage: function () {
        glob.sync(Path.join(pageDir, "*/")).forEach(function (f) {
            const api = Path.join(f, 'index.js')
            if (!isProduction) {
                delete require.cache[api];
            }
            apis[api] = new (require(api)).default();

            const vue = Path.join(f, '.s');
            temps.push(vue);
            const dir = f.substring(0, f.length - 1);
            const pageName = dir.substring(dir.lastIndexOf('/') + 1);
            if (!fs.exists(vue)) {
                fs.copy(Path.join(__dirname, '../../vue.js'), vue);
            }
            serverEntry[pageName] = vue;

            const c = Path.join(f, '.c');
            temps.push(c);
            if (!fs.exists(c)) {
                fs.copy(Path.join(__dirname, '../../client.js'), c);
            }
            clientEntry[pageName] = c;
        });
    },
    getAPI: function (name, action) {
        if (!apis[name] || !apis[name][action] || process.env.NODE_ENV !== 'production') {
            module.exports.initPage();
        }
        const api = apis[name];
        if (api && api[action]) {
            return api[action];
        }
        return null;
    },
    initCompile: function () {
        serverConfig.entry = serverEntry;
        serverConfig.output.path = Path.join(staticDir,'../bundle');

        clientConfig.entry = clientEntry;
        clientConfig.output.path = Path.join(staticDir,'bundle');

        serverCompiler = webpack(serverConfig);
        clientCompiler = webpack(clientConfig);

        if (!isProduction) {
            serverCompiler.outputFileSystem = serverFs;
            clientCompiler.outputFileSystem = clientFs;
        }
    },
    compileRun: async function () {
        serverStats = await  webpackCompileRun(serverCompiler);
        clientStats = await  webpackCompileRun(clientCompiler, function () {
            clear();
        });
    },
    isProduction: function () {
        return isProduction;
    },
    readServerFileSync: function (pageName) {
        const p = serverStats.compilation.assets[pageName].existsAt;
        return (isProduction ? FS : serverFs).readFileSync(p, 'utf8');
    },
    readClientFile: function (pageName) {
        const p = clientStats.compilation.assets[pageName].existsAt;
        return clientFs.readFileSync(p);
    },
    getClientFilePath: function (pageName) {
        return clientStats.compilation.assets[pageName].existsAt;
    }
}