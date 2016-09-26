/**
 * Created by joe on 16/9/22.
 */

'use strict';

require('babel-register')({
    "plugins": [
        "transform-async-to-generator",
        "transform-es2015-modules-commonjs"
    ]
});

const app = require('./server/app');
app.call({}, {root: __dirname});