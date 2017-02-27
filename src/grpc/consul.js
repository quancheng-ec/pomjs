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

async function _init(consulNode,group) {

    let checks = await _consul.health.service({
        service: consulNode,
        passing: true
    });
    const services = {};
    checks[0].forEach(function (c) {
        const s = c.Service;
        const ids = s.ID.split('-');
        const name = ids [1];
        let service = {
            name: name,
            host: ids[0],
            address: s.Address,
            port: s.Port,
            version: ids[2],
            group:group
        };
        let ss = [];
        if (services[service.name]) {
            ss = services[service.name];
        } else {
            services[service.name] = ss;
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
            try{
              _services[group] = await _init(sgroup,group);
            }catch (e){
                console.error('sync consul error!',e);
            }
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

