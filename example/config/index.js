/**
 * Created by joe on 2016/10/15.
 */

const path = require('path');
const opts = {

    static: path.join(__dirname, '../static'),// 静态文件目录
    layout: path.join(__dirname, '../layouts'),// layout文件目录
    page: path.join(__dirname, '../pages'),
    components: path.join(__dirname, '../components')
    //build: './build', //编译后的目录
    , root: path.join(__dirname, '../'),
    domain:'localhost'

}



module.exports = opts;