/**
 *
 * 权限请求和验证
 *
 * Created by zhaominghai on 16/12/5.
 */



const verify = function (ctx){
    let token = ctx.cookies.get('token');
    //todo fetch userinfo from accountService by token
    return false;
};

module.exports = function(opts = {}) {

    return async function auth(ctx,next) {
        if(verify(ctx) ) {
            ctx.status = 401;
            return ctx.redirect('http://www.baidu.com');
        }

        ctx.auth = ctx.headers;
        await next();
        //检查请求头部是否包含token，没有直接抛，或者在开发环境做个配置
        //获取token
        //用token 去请求用户信息
        //整理用户信息，不存在抛
        //拿用户信息链接Grpc验证权限
        //得出结论，此次请求ctx.request是否允许，不允许报message
        //若一切都允许，则render一个html代码，经过组织的菜单页面。
    }
};