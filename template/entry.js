/**
 * Created by joe on 2016/10/14.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'
Vue.use(VueResource);

Vue.http.headers.common["X-CSRF-Token"] = context.csrf
const context = window.__vue_context_data|| {};

// Vue.mixin({
//     data:function(){
//         return context;
//     }
// })

const view = require({{ view }});

if(view.mixins){
  view.mixins.push({
    data: function() {
      return context;
    }
  })
}else{
  view.mixins = [{
    data: function() {
      return context;
    }
  }];
}

new Vue(view).$mount('#wrapper');


