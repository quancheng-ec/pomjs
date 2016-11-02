'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by joe on 2016/10/23.
 */

var consul = require('./consul');
var client = require('./client');

var _apis = {};

module.exports = {
    init: function () {
        var _ref = _asyncToGenerator(function* () {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var services = opts.saluki || {};
            yield consul.init(opts);
            Object.assign(_apis, client.init(opts.saluki));
        });

        function init(_x) {
            return _ref.apply(this, arguments);
        }

        return init;
    }(),
    services: function services() {
        return _apis;
    }
};