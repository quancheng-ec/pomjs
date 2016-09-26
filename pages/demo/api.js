/**
 * Created by joe on 16/9/25.
 */

export default class Index {


    constructor() {

    }

    view(ctx) {
        // console.log(123);
        console.log(ctx);

        this.result = {
            bb: 123

        };
        return {
            a: '123'

        }

    }

    get(){
        this.result = {
            cc:1
        };

        return "hello";
    }

}