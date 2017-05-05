import Vue from 'vue'



export default function (context={}) {

    View.mixins = [{
        data: function () {
          return context;
        }
    }];
    //const action = context.pageContext.pageAction;

    const view = require({{ view }});



    const app = new Vue(View);

    return Promise.resolve(app);
};



