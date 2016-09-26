/**
 * Created by joe on 16/9/25.
 */

export default class Index {


    constructor() {

    }

    view(ctx) {
        // console.log(123);
        console.log(this.href);

        this.result = {
            bb: 123

        };
        return {
            msg: '123',
            text:"哈哈"
        }

    }

    get(){
        this.result = {
            cc:1
        };

        return "hello";
    }

}