/**
 * Created by joe on 2016/10/14.
 */

var  Vue = require('vue');
var  VueResource = require('vue-resource');
var fetch =require('whatwg-fetch');

//const Url = require('browser-url');

Vue.use(VueResource);

var fetchPlugin = {
    install: function (Vue, options) {
        Vue.fetch = fetch;
        Vue.prototype.fetch = fetch;
    }
}

Vue.use(fetchPlugin);

var context = __vue_context_data;

Vue.http.headers.common["X-CSRF-Token"] = context.csrf

var view = require('./' + context.pageContext.pageAction + '.vue');

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



