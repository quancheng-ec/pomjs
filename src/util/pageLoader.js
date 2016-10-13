/**
 * Created by joe on 2016/10/13.
 */



const glob = require("glob");
//const fs = require('fs');
var fs = require('fs-sync');

const Path = require('path')
const apis = {};
var pageDir;

const serverEntry = {};

/**
 * 查找page目录
 * @param pagePath
 */
function findPage() {
    glob.sync(Path.join(pageDir, "*/")).forEach(function (f) {
        const api = Path.join(f, 'index.js')
        if (process.env.NODE_ENV !== 'production') {
            delete require.cache[api];
        }
        apis[api] = new (require(api)).default();

        const vue = Path.join(f, '.s');
        const dir = f.substring(0, f.length - 1);
        const pageName = dir.substring(dir.lastIndexOf('/')+1);
        if (!fs.exists(vue)) {
            fs.copy(Path.join(__dirname, '../../vue.js'), vue);
        }
        serverEntry[pageName] = vue;


    });


}


module.exports = {

    init: function (regPath) {
        pageDir = regPath;
    },
    findPage: findPage,
    getAPI: function (name, action) {
        if (!apis[name] || !apis[name][action] || process.env.NODE_ENV !== 'production') {
            findPage();
        }

        const api = apis[name];
        if (api && api[action]) {
            return api[action];
        }

        return null;
    },
    getServerEntry: function () {

        return serverEntry;

    }
}