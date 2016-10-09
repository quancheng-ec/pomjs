import Vue from 'vue'
//import VueResource from 'vue-resource'


//Vue.use(VueResource);


Vue.mixin({

})


export default function (context) {

    let View = require('./' + context._page + '/App.vue');

    const app = new Vue(Object.assign(View, {
        data() {
            return context
        },
        mounted: function () {
        }
    })).$mount('#wrapper');

    return Promise.resolve(app);
};

