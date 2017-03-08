/**
 * Created by joe on 16/9/25.
 */

export default class Index {


    constructor() {

    }

    view(ctx) {
        // console.log(123);
        console.log(ctx.href);

        ctx.result = {
            bb: 123

        };
        return {
            title:"全程工作台",
            msg: 'success',
            text:"服务器渲染成功!!!"
        }

    }

    get(ctx){
        ctx.result = {
            cc:1
        };

        return {
            hello: "hello"
        };
    }

}