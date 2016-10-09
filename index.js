/**
 * Created by joe on 16/9/22.
 */


require('babel-register')({
    "plugins": [
        "transform-async-to-generator",
        "transform-es2015-modules-commonjs"
    ]
});

const app = require('./src/app');
app.call({}, {root: __dirname});

const opts = {

    static:'./static',// 静态文件目录
    build:'./build' //编译后的目录

}


class ViewModel{
    constructor(data,title){
        this.data = data;
        this.title = title;
        this.layout = 'default';
    }
}