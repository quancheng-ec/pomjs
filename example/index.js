/**
 * Created by joe on 16/9/22.
 */

const path = require('path');

const app = require('../src/index');


const opts = {

    static: path.join(__dirname, 'static'),// 静态文件目录
    layout: path.join(__dirname, 'layouts'),// layout文件目录
    page: path.join(__dirname, 'pages'),
    components: path.join(__dirname, 'components')
    //build: './build', //编译后的目录
    ,root: __dirname

}

app(opts);


class ViewModel {
    constructor(data, title) {
        this.data = data;
        this.title = title;
        this.layout = 'default';
    }
}