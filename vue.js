import Vue from 'vue'


export default function (context) {

    const action = context.pageContext.pageAction;

    let View = require('./' + action + '.vue');

    const app = new Vue(Object.assign(View, {
        data() {
            return context
        },
        mounted: function () {
        }
    }));

    return Promise.resolve(app);
};

