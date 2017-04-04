/**
 * Created by joe on 2016/10/14.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'

//const Url = require('browser-url');

Vue.use(VueResource);


const context = window.__vue_context_data|| {};


Vue.mixin({
    data:function(){
        return context;
    }
})


const view = require('./View.vue');

new Vue(view).$mount('#wrapper');



