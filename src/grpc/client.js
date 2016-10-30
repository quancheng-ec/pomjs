/**
 * Created by joe on 2016/10/22.
 */

const Path = require('path');
const FS = require('fs');
const grpc = require('grpc');
const glob = require("glob");
const _ = require('lodash');
const consul = require('./consul');
//
// {
//     getALL: function () {
//         return {
//             'com.quancheng.examples.service.HelloService': [{
//                 name: 'com.quancheng.examples.service.HelloService',
//                 host: '127.0.0.1:5051'
//             }, {
//                 name: 'com.quancheng.examples.service.HelloService',
//                 host: '127.0.0.1:5052'
//             }]
//         };
//     }
// };


let protos = {};


function initClient(saluki) {

    console.log('init saluki client!');

    const root = saluki.root;//'/Users/joe/work/service-all/api/src/main/proto/';
    glob.sync(Path.join(root, "**/*_service.proto")).forEach(function (f) {
        const proto = grpc.load({root: root, file: f.substring(root.length)});
        protos = _.defaultsDeep(protos, proto);
    });

    const apis = {};
    for (var i in saluki.services) {
        const serviceDef = saluki.services[i];
        const ss = serviceDef.split('@');
        const sds = ss[0].split(':');
        const api = {};

        if (ss[1]) {
            api.target = ss[1];
        }
        if (sds.length === 3) {
            // name:group:version
            api.name = sds[0];
            api.group = sds[1];
            api.version = sds[2];
        } else if (sds.length === 2) {
            // name:version
            api.name = sds[0];
            api.group = saluki.salukiGroup || 'default';
            api.version = sds[1];
        } else if (sds.length === 1) {
            // name
            api.name = sds[0];
            api.group = saluki.salukiGroup || 'default';
            api.version = '1.0.0';
        }
        const names = api.name.split('.');
        let instances = protos;
        names.forEach(function (n) {
            instances = !instances ? null : instances[n];
        });
        if (!instances) {
            console.error('the proto not found', serviceDef);
            continue;
        }
        api.methods = {};
        api._grpc = instances;
        api._clientPool = {};
        wrapService(api);
        apis[i] = api;
    }
    return apis;
}

function getClient(api) {

    if (api.target) {
        if (api.client) {
            return api.client;
        }
        const client = new api._grpc(api.target, grpc.credentials.createInsecure());
        api.client = client;
        return api.client;
    }


    const provider = consul.getALL()[api.name];
    if (!provider) {
        console.error('the service provider not found', serviceDef);
        return null;
    }

    const providerHosts = [];
    provider.forEach(function (s) {
        //匹配provide和当前的service声明，如果相同则记录下来
        if (s.group || 'default' === api.group && s.version || '1.0.0' === api.version) {
            providerHosts.push(s.host);
        }
    })
    if (providerHosts.length === 0) {
        console.error('the service provider not found', serviceDef, 'please check saluki service config');
        return null;
    }

    const pool = api._clientPool;

    const host = randomLoadbalancer(providerHosts);
    if (pool[host]) {
        return pool[host];
    }

    const client = new api._grpc(host, grpc.credentials.createInsecure());
    pool[host] = client;
    return client;
}

function wrapService(api) {
    const methods = api._grpc.service.children;
    methods.forEach(function (ins) {
        api.methods[ins.name] = promising(api, ins.name)
    })
}

function promising(api, name) {
    return function (req, callback) {
        const client = getClient(api);
        return new Promise(function (resolve, reject) {
            client[name](req, function (err, resp) {
                if (err) {
                    err.message = 'grpc invoke error:' + api.name + "." + name + JSON.stringify(req);
                    reject(err);
                } else {
                    resolve(resp);
                }
                if (callback) {
                    callback(err, resp);
                }
            });
        });
    };
}

function randomLoadbalancer(providerHosts) {
    const index = getRandomIntInclusive(0, providerHosts.length - 1);
    const host = providerHosts[index];
    //var client = new instances(si, grpc.credentials.createInsecure());
    return host;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = {
    init: initClient
}
