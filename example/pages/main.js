import Vue from 'vue'


export default function (context) {

    let View = require('./' + context.pageContext.pageName + '/App.vue');

    const app = new Vue(Object.assign(View, {
        data() {
            return context
        },
        mounted: function () {
        }
    }));

    return Promise.resolve(app);
};

