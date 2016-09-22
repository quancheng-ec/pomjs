/**
 * Created by joe on 16/9/22.
 */

'use strict';

require('babel-register')();

const app = require('./src/app')({root:__dirname+"/static"});