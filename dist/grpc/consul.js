'use strict';

var _bluebird = require('bluebird');

var _init = function () {
    var _ref = (0, _bluebird.coroutine)(function* (consulNode, group) {

        var checks = yield _consul.health.service({
            service: consulNode,
            passing: true
        });
        var services = {};
        checks[0].forEach(function (c) {
            var s = c.Service;
            var ids = s.ID.split('-');
            var name = ids[1];
            var service = {
                name: name,
                host: ids[0],
                address: s.Address,
                port: s.Port,
                version: ids[2],
                group: group
            };
            var ss = [];
            if (services[service.name]) {
                ss = services[service.name];
            } else {
                services[service.name] = ss;
            }
            services[service.name].push(service);
        });
        return services;
    });

    return function _init(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

/**
 *
 *{
    name: 'com.quancheng.zeus.service.ProductPackageService',
    host: '10.100.8.110:10013',
    address: '10.100.8.110',
    port: 10013,
    group: 'dev',
    version: '1.0.0'
 }
 *
 * Created by joe on 2016/10/20.
 */

var URL = require('url');

var Bluebird = require('bluebird');

function fromCallback(fn) {
    return new Bluebird(function (resolve, reject) {
        try {
            return fn(function (err, data, res) {
                if (err) {
                    err.res = res;
                    return reject(err);
                }
                return resolve([data, res]);
            });
        } catch (err) {
            return reject(err);
        }
    });
}

var _consul;
var _services = {};

module.exports = {

    init: function () {
        var _ref2 = (0, _bluebird.coroutine)(function* () {
            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var saluki = opts.saluki || {};

            _consul = require('consul')({
                promisify: fromCallback,
                host: saluki.host || '127.0.0.1',
                port: saluki.port || '8500'
            });
            var group = saluki.group ? saluki.group : 'default';
            module.exports.initWidthGroup(group);
        });

        function init() {
            return _ref2.apply(this, arguments);
        }

        return init;
    }(),
    /**
     * 初始化group
     * @param group
     */
    initWidthGroup: function () {
        var _ref3 = (0, _bluebird.coroutine)(function* (group) {
            console.log('init consul client widthgroup ' + group);
            var sgroup = 'saluki_' + group;
            var func = function () {
                var _ref4 = (0, _bluebird.coroutine)(function* () {
                    try {
                        _services[group] = yield _init(sgroup, group);
                    } catch (e) {
                        console.error('sync consul error!', e);
                    }
                    setTimeout(func, 10000);
                });

                return function func() {
                    return _ref4.apply(this, arguments);
                };
            }();
            setTimeout(func, 0);
        });

        function initWidthGroup(_x4) {
            return _ref3.apply(this, arguments);
        }

        return initWidthGroup;
    }(),
    setServices: function setServices(services) {
        _services = services;
    },
    getALL: function getALL() {
        return _services;
    },
    getService: function getService(api) {
        if (_services[api.group]) {
            return _services[api.group][api.name];
        }
        return _services;
    },
    consulClient: function consulClient() {
        return _consul;
    }
};