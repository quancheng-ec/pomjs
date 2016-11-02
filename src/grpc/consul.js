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

let consul_node;
let _services = {};

async function _init(consulNode) {

    if (consulNode && !consul_node) {
        consul_node = consulNode;
    }
    let checks ;

    let checks = await _consul.health.service({
        service: consul_node,
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
        }
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
        const group = saluki.group ? 'Saluki_' + saluki.group : 'Saluki_dev';

        console.log('init consul client!');

        const func = async function () {
            _services = await _init(group);
            setTimeout(func, 10000);
        }
        setTimeout(func, 0);
    },
    setServices: function (services) {
        _services = services;
    },
    getALL: function () {
        return _services;
    }

}

