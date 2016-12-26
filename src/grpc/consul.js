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

const URL = require('url');

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

let _services = {};

async function _init(consulNode) {

    let checks = await _consul.health.service({
        service: consulNode,
        passing: true
    });
    const services = {};
    checks[0].forEach(function (c) {
        const s = c.Service;

        let serviceUrl = decodeURIComponent(s.Tags[0]);
        serviceUrl = serviceUrl.substring(serviceUrl.indexOf('Grpc://'));

        const serviceURLObj = URL.parse(serviceUrl, true);
        let service = {
            name: serviceURLObj.pathname.substring(1),
            host: serviceURLObj.host,
            address: s.Address,
            port: s.Port
        };
        Object.assign(service, serviceURLObj.query);
        if (!services[service.name]) {
            services[service.name] = [];
        }
        services[service.name].push(service);
    });

    return services;

}


module.exports = {

    init: async function init(opts = {}) {
        const saluki = opts.saluki || {};

        _consul = require('consul')({
            promisify: fromCallback,
            host: saluki.host || '127.0.0.1',
            port: saluki.port || '8500'
        });
        const group = saluki.group ? saluki.group : 'default';
        module.exports.initWidthGroup(group);
    },
    /**
     * 初始化group
     * @param group
     */
    initWidthGroup: async function (group) {
        console.log('init consul client widthgroup ' + group);
        const sgroup = 'saluki_' + group;
        const func = async function () {
            _services[group] = await _init(sgroup);
            setTimeout(func, 10000);
        };
        setTimeout(func, 0);
    },
    setServices: function (services) {
        _services = services;
    },
    getALL: function () {
        return _services;
    },
    getService: function (api) {
        if (_services[api.group]) {
            return _services[api.group][api.name];
        }
        return _services;
    }

};

