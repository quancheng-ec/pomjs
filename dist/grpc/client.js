'use strict';

/**
 * Created by joe on 2016/10/22.
 */

var Path = require('path');
var FS = require('fs');
var grpc = require('grpc');
var glob = require("glob");
var _ = require('lodash');
var consul = require('./consul');
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


var protos = {};

function initClient(saluki) {

    console.log('init saluki client!');

    var root = saluki.root; //'/Users/joe/work/service-all/api/src/main/proto/';
    glob.sync(Path.join(root, "**/*_service.proto")).forEach(function (f) {
        var proto = grpc.load({ root: root, file: f.substring(root.length) });
        protos = _.defaultsDeep(protos, proto);
    });

    var apis = {};

    var _loop = function _loop() {
        var serviceDef = saluki.services[i];
        var ss = serviceDef.split('@');
        var sds = ss[0].split(':');
        var api = {};

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
        var names = api.name.split('.');
        var instances = protos;
        names.forEach(function (n) {
            instances = !instances ? null : instances[n];
        });
        if (!instances) {
            console.error('the proto not found', serviceDef);
            return 'continue';
        }
        api.methods = {};
        api._grpc = instances;
        api._clientPool = {};
        wrapService(api);
        apis[i] = api;
    };

    for (var i in saluki.services) {
        var _ret = _loop();

        if (_ret === 'continue') continue;
    }
    return apis;
}

function getClient(api) {

    if (api.target) {
        if (api.client) {
            return api.client;
        }
        var _client = new api._grpc(api.target, grpc.credentials.createInsecure());
        api.client = _client;
        return api.client;
    }

    var provider = consul.getALL()[api.name];
    if (!provider) {
        console.error('the service provider not found', serviceDef);
        return null;
    }

    var providerHosts = [];
    provider.forEach(function (s) {
        //匹配provide和当前的service声明，如果相同则记录下来
        if (s.group || 'default' === api.group && s.version || '1.0.0' === api.version) {
            providerHosts.push(s.host);
        }
    });
    if (providerHosts.length === 0) {
        console.error('the service provider not found', serviceDef, 'please check saluki service config');
        return null;
    }

    var pool = api._clientPool;

    var host = randomLoadbalancer(providerHosts);
    if (pool[host]) {
        return pool[host];
    }

    var client = new api._grpc(host, grpc.credentials.createInsecure());
    pool[host] = client;
    return client;
}

function wrapService(api) {
    var methods = api._grpc.service.children;
    methods.forEach(function (ins) {
        api.methods[ins.name] = promising(api, ins.name);
    });
}

function promising(api, name) {
    return function (req, callback) {
        var client = getClient(api);
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
    var index = getRandomIntInclusive(0, providerHosts.length - 1);
    var host = providerHosts[index];
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
};