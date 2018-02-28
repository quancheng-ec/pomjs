'use strict';

var _bluebird = require('bluebird');

/**
 * Created by joe on 2016/10/17.
 */

var pageLoader = require('./util/pageLoader');
var fs = require('fs-sync');

module.exports = (0, _bluebird.coroutine)(function* () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    Object.assign(process.env, opts);
    opts.isProduction = true;
    fs.copy(opts.src, opts.build, { force: true });

    pageLoader.init(opts);
    pageLoader.initCompile(opts);
    yield pageLoader.compileRun(function (assets) {
        //console.log(assets.compilation.assets['po.style.css'])
    });
});