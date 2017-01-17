'use strict';

var initClient = function () {
  var _ref = _asyncToGenerator(function* (saluki) {

    console.log('init saluki client!');
    loadPem();
    var root = saluki.root; //'/Users/joe/work/service-all/api/src/main/proto/';
    glob.sync(Path.join(root, "**/*_service.proto")).forEach(function (f) {
      var proto = grpc.load({ root: root, file: f.substring(root.length) });
      protos = _.defaultsDeep(protos, proto);
    });

    var apis = {};
    var groups = {};

    var _loop = function _loop(i) {
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
      apis[i] = wrapService(api);
      groups[api.group] = true;
    };

    for (var i in saluki.services) {
      var _ret = _loop(i);

      if (_ret === 'continue') continue;
    }
    yield initConsuls(groups);
    return apis;
  });

  return function initClient(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * 初始化Consul配置
 * @param apis
 */


var initConsuls = function () {
  var _ref2 = _asyncToGenerator(function* (groups) {
    for (var i in groups) {
      yield consul.initWidthGroup(i);
    }
  });

  return function initConsuls(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * 获取api对应的grpc的连接
 * @param api
 * @returns {*}
 */


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by joe on 2016/10/22.
 */

var Path = require('path');
var FS = require('fs');
var grpc = require('grpc');
var glob = require("glob");
var _ = require('lodash');
var consul = require('./consul');

var grpcOptions = {
  'grpc.ssl_target_name_override': 'grpc',
  'grpc.default_authority': 'grpc'
};

var metadataUpdater = function metadataUpdater(service_url, callback) {
  var metadata = new grpc.Metadata();
  metadata.set('plugin_key', 'plugin_value');
  callback(null, metadata);
};

var ssl_creds = void 0,
    creds = void 0,
    mcreds = void 0,
    combined_creds = void 0;

var protos = {};

function loadPem() {
  var pem = Path.join(__dirname, '../../server.pem');
  console.log("load " + pem);
  ssl_creds = grpc.credentials.createSsl(FS.readFileSync(pem));
  creds = grpc.credentials.createInsecure();
  mcreds = grpc.credentials.createFromMetadataGenerator(metadataUpdater);
  combined_creds = grpc.credentials.combineChannelCredentials(ssl_creds, mcreds);
}

function getClient(api, index) {

  // if (api.target) {
  //   if (api.client) {
  //     return api.client;
  //   }
  //   const client = new api._grpc(api.target, combined_creds, grpcOptions);
  //   api.client = client;
  //   return api.client;
  // }

  var provider = consul.getService(api);
  if (!provider) {
    console.error('the service provider not found', api.name);
    return null;
  }

  var providerHosts = [];
  provider.forEach(function (s) {
    //匹配provide和当前的service声明，如果相同则记录下来
    if ((s.group || 'default') === api.group && (s.version || '1.0.0') === api.version) {
      providerHosts.push(s.host);
    }
  });
  if (providerHosts.length === 0) {
    console.error('the service provider not found', api, 'please check saluki service config');
    return null;
  }
  //如果有重试行为，清除 client连接缓存
  if (index) {
    loadPem();
    api._clientPool = {};
  }
  var pool = api._clientPool;
  var host = randomLoadbalancer(providerHosts);
  if (pool[host]) {
    return pool[host];
  }

  var client = new api._grpc(host, combined_creds, grpcOptions);
  pool[host] = client;
  client._host = host;
  return client;
}

function wrapService(api) {
  var methods = api._grpc.service.children;
  var service = {};
  methods.forEach(function (ins) {
    service[ins.name] = promising(api, ins.name);
  });
  return service;
}

function promising(api, name) {

  var invoke = function invoke(req, callback, resolve, reject, index) {
    var client = getClient(api, index);
    client[name](req, function (err, resp) {
      if (err) {
        var reqstr = JSON.stringify(req);
        console.error(client._host, api.name, name, reqstr, err, index || 0);
        //如果有网络错误重试五次
        if (err.code == 14 && index < 3) {
          index++;
          invoke(req, callback, resolve, reject, index);
          return;
        }
        if (!err.message) {
          err.message = 'grpc invoke error:' + api.name + "." + name + reqstr;
        }
        reject(err);
      } else {
        resolve(resp);
      }
      if (callback) {
        callback(err, resp);
      }
    });
  };

  return function (req, callback) {
    var index = 0;
    return new Promise(function (resolve, reject) {
      invoke(req, callback, resolve, reject, index);
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