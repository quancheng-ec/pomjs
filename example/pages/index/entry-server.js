import Vue from 'vue'



export default function (context={}) {

    Vue.mixin({
        data: function () {
            return context;
        }
    });
    //const action = context.pageContext.pageAction;

    let View = require('./View.vue');



    const app = new Vue(View);

    return Promise.resolve(app);
};



