import Vue from 'vue'

export default function (context) {

    const action = context.pageContext.pageAction;

    let View = require('./' + action + '.vue');


    Vue.mixin({
        data: function () {
            return context;
        }
    })

    const app = new Vue(Object.assign(View, {
        // data:function(){
        //     return context;
        // },
        // mounted: function () {
        // }
    }));

    return Promise.resolve(app);
};

