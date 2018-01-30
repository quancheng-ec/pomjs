'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var Bluebird = require('bluebird');
var consul = require('consul');
var debug = require('debug')('pomjs:consul-client');

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

function findNode(group) {
  return function (serviceNode) {
    var _serviceNode$Service = serviceNode.Service,
        ID = _serviceNode$Service.ID,
        Address = _serviceNode$Service.Address,
        Port = _serviceNode$Service.Port;

    var _ID$split = ID.split('-'),
        _ID$split2 = _slicedToArray(_ID$split, 3),
        host = _ID$split2[0],
        name = _ID$split2[1],
        version = _ID$split2[2];

    return {
      name: name,
      host: host,
      address: Address,
      port: Port,
      version: version,
      group: group
    };
  };
}

var consulClient = {};

var services = {};

var init = function init(opts) {
  var saluki = opts.saluki || {};

  consulClient = consul({
    promisify: fromCallback,
    host: saluki.host || '127.0.0.1',
    port: saluki.port || '8500'
  });

  saluki.group.forEach(watchService);

  return consulClient;
};

var handleServiceCheck = function handleServiceCheck(group) {
  return function (data) {
    var _services = {};

    data.forEach(function (n) {
      var service = findNode(group)(n);
      debug('service: %o', service);(_services[service.name] || (_services[service.name] = [])).push(service);
    });

    Object.assign(services, _services);
  };
};

var watchService = function watchService(group) {
  var serviceName = 'saluki_' + group;
  var watcher = consulClient.watch({
    method: consulClient.health.service,
    options: {
      service: serviceName,
      passing: true
    }
  });

  watcher.on('change', function (data) {
    console.log('%s on consul has changed on %s', serviceName, new Date());
    handleServiceCheck(group)(data);
  });

  watcher.on('error', function (err) {
    console.log('watch service %s on consul error:', serviceName, err);
  });
};

module.exports = exports = {
  init: init,
  getALL: function getALL() {
    return services;
  },
  getService: function getService(api) {
    if (services[api.group]) {
      return services[api.group][api.name];
    }
    return null;
  }
};