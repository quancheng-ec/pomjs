'use strict';

/**
 * Created by joe on 2016/10/20.
 */

var consul = require('consul')({
    host: 'daily.quancheng-ec.com',
    port: '8500'
});

consul.catalog.service.nodes('Saluki_jimmy', function (err, result) {
    if (err) throw err;

    //console.log(result);

    var services = {};
    result.forEach(function (s) {
        services[s.ServiceID] = s;
    });

    consul.agent.check.list(function (err, cresult) {
        if (err) throw err;

        for (var i in cresult) {
            var name = i.replace('service:', "");
            if (services[name] && cresult[i].Status === 'passing') {
                console.log(name, services[name]);

                var serviceDef = services[name];

                decodeURIComponent(serviceDef.ServiceTags[0]);
            }
        }
    });
});