/**
 * Created by joe on 2016/10/14.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'
import fetch from 'whatwg-fetch';

//const Url = require('browser-url');

Vue.use(VueResource);

const fetchPlugin = {
    install: function (Vue, options) {
        Vue.fetch = fetch;
        Vue.prototype.fetch = fetch;
    }
}

Vue.use(fetchPlugin);

const context = __vue_context_data;

const view = require('./' + context.pageContext.pageAction + '.vue');

view.mixins = [{
  data: function () {
    return context;
  }
}];

new Vue(view).$mount('#wrapper');



