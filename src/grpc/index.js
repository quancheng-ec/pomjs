/**
 * Created by joe on 2016/10/23.
 */

const consul = require('./consul');
const client = require('./client');

const _apis = {};

module.exports = {
    init: async function (opts = {}) {
        const services = opts.saluki || {};
        await consul.init(opts);
        Object.assign(_apis, client.init(opts.saluki));
    },
    services: function () {
        return _apis;
    }
}
