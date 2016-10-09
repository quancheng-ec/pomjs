/**
 * Created by joe on 16/9/24.
 */

var model = {

    layout: 'layout',
    data: {},
    title: '',
    desc: ''


}

export default class ViewModel{

    constructor(data,title){
        this.data = data;
        this.title = title;
        this.layout = 'default';
    }



}