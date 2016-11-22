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
var isProduction = false;//process.env.NODE_ENV === 'production';
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
const webpackCompileRun = function (tag, compile, cb) {
    return new Promise(function (resolve, reject) {
        compile.run((err, stats) => {
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

const find = function (f) {
    const api = Path.join(f, 'index.js');
    //只有开发环境才会打开热更新逻辑，热更新会导致webstorm debug 失败，所以可以接受 DEBUG参数
    if (!isProduction && apis[api] && !process.env.DEBUG) {
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
}

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

let root = '';
let vue_build_path;
let build;

module.exports = {

    init: function (opts) {
        root = opts.root;
        if (!opts.page) {
            throw new Error("the opts page can't be null");
        }
        if (opts.isProduction) {
            isProduction = true;
            vue_build_path = Path.join(root, 'vue_build.json');
            if (fs.exists(vue_build_path)) {
                build = require(vue_build_path);
            }
        }
        pageDir = isProduction ? opts.page.build : opts.page.src; //|| Path.join(opts.root, 'pages');
        staticDir = opts.static || Path.join(root, 'static');
        module.exports.initPage();
    },
    getPageDir: function () {
        return pageDir;
    },
    //查找page目录
    initPage: function () {
        glob.sync(Path.join(pageDir, "*/")).forEach(find);
        glob.sync(Path.join(__dirname, "../pages/*/")).forEach(find);
    },
    getAPI: function (name, action) {
        if (!apis[name] || !apis[name][action] || !isProduction) {
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
        serverConfig.output.path = Path.join(staticDir, '../bundle');

        clientConfig.entry = clientEntry;
        clientConfig.output.path = Path.join(staticDir, 'bundle');

        serverCompiler = webpack(serverConfig);
        clientCompiler = webpack(clientConfig);

        if (!isProduction) {
            serverCompiler.outputFileSystem = serverFs;
            clientCompiler.outputFileSystem = clientFs;
            fs.remove(clientConfig.output.path);
        }
    },
    compileRun: async function () {
        serverStats = await  webpackCompileRun('server build:', serverCompiler);
        clientStats = await  webpackCompileRun('client build:', clientCompiler, function () {
            clear();
        });

        if (isProduction) {
            if (fs.exists(vue_build_path)) {
                fs.remove(vue_build_path);
            }
            const s = {};
            for (let i in serverStats.compilation.assets) {
                s[i] = serverStats.compilation.assets[i].existsAt;
                s[i] = s[i].substring(root.length);
            }
            const c = {};
            for (let i in clientStats.compilation.assets) {
                c[i] = clientStats.compilation.assets[i].existsAt;
                c[i] = c[i].substring(root.length);
            }
            const j = {server: s, client: c};
            const js = JSON.stringify(j);
            fs.write(vue_build_path, js);
        }

    },
    isProduction: function () {
        return isProduction;
    },
    readServerFileSync: function (pageName) {
        const rootPath = Path.resolve(staticDir,'../');
        const p = isProduction ? Path.resolve(rootPath, build.server[pageName]) : serverStats.compilation.assets[pageName].existsAt;
        return (isProduction ? FS : serverFs).readFileSync(p, 'utf8');
    },
    readClientFile: function (pageName) {
        const rootPath = Path.resolve(staticDir,'../');
        const p = isProduction ? Path.resolve(rootPath, build.client[pageName]) : clientStats.compilation.assets[pageName].existsAt;
        return clientFs.readFileSync(p);
    },
    getClientFilePath: function (pageName) {
        return clientStats.compilation.assets[pageName].existsAt;
    }
}
