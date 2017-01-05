'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by joe on 2016/10/17.
 */

var pageLoader = require('./util/pageLoader');
var fs = require('fs-sync');

module.exports = function () {
    var _ref = _asyncToGenerator(function* () {
        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        opts.isProduction = true;
        fs.copy(opts.src, opts.build, { force: true });

        pageLoader.init(opts);
        pageLoader.initCompile();
        yield pageLoader.compileRun(function (assets) {
            //console.log(assets.compilation.assets['po.style.css'])
        });
    });

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}();