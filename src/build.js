/**
 * Created by joe on 2016/10/17.
 */

const pageLoader = require('./util/pageLoader');
const fs = require('fs-sync');


module.exports = async function (opts = {}) {
    opts.isProduction = true;
    fs.copy(opts.src, opts.build, {force: true});

    pageLoader.init(opts);
    pageLoader.initCompile();
    await pageLoader.compileRun();

};