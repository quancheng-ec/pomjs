/**
 * Created by joe on 16/9/22.
 */


require('babel-register')({
    "plugins": [
        "transform-async-to-generator",
        "transform-es2015-modules-commonjs"
    ]
});

module.exports = require('./app');