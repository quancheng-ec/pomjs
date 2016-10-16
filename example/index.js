/**
 * Created by joe on 16/9/22.
 */


const app = require('../src/index');


const appConfig = require('./config/index');

app(appConfig);


class ViewModel {
    constructor(data, title) {
        this.data = data;
        this.title = title;
        this.layout = 'default';
    }
}