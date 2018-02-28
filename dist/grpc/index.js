'use strict';

var _bluebird = require('bluebird');

/**
 * Created by joe on 2016/10/23.
 */

var client = require('./client');
var consulClient = require('./consul-client');

var _apis = {};

module.exports = {
  init: function () {
    var _ref = (0, _bluebird.coroutine)(function* () {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!opts.saluki) {
        console.log('no saluki config,ignore this step!');
        return;
      }
      opts.saluki.services = opts.saluki.services || {};
      consulClient.init(opts);

      //await consul.init(opts)
      Object.assign(_apis, (yield client.init(opts.saluki)));
    });

    function init() {
      return _ref.apply(this, arguments);
    }

    return init;
  }(),
  services: function services() {
    return _apis;
  },
  grpcOptions: client.grpcOptions
};