/**
 * Created by joe on 16/9/25.
 */

var Vue = require('vue');
var App = require('./App.vue')


const VueApp = Vue.extend(App);
new VueApp({
    el: '#page'
})

