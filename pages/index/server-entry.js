import Vue from 'vue';
import App from './App.vue';


// the default export should be a function
// which will receive the context of the render call
export default function (context) {

    const app = new Vue(Object.assign(App, {
        data: context
    }))

    return new Promise((resolve, reject) => {
        resolve(app);
    });
};
