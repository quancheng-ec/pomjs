/**
 * Created by joe on 2016/10/14.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'
import fetch from 'whatwg-fetch'

Vue.use(VueResource)

const fetchPlugin = {
  install: function (Vue, options) {
    Vue.fetch = fetch
    Vue.prototype.fetch = fetch
  }
}

Vue.use(fetchPlugin)

var context = __vue_context_data

Vue.http.headers.common['X-CSRF-Token'] = context.csrf

const view = require('./' + context.pageContext.pageAction + '.vue')

if (view.mixins) {
  view.mixins.push({
    data: function () {
      return context
    }
  })
} else {
  view.mixins = [
    {
      data: function () {
        return context
      }
    }
  ]
}

new Vue(view).$mount('#wrapper')
