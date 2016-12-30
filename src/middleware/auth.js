/**
 *
 * 权限请求和验证
 *
 * Created by zhaominghai on 16/12/5.
 */


import get from 'lodash/get';
import grpc from '../grpc/index';
const grpc_services = grpc.services();

const wavemenus = function(array){
    let fathers = [],children = [];
    array = array.map(res=>{
        res['href']=res['url'];
        res['isActive'] = false;
        res['icon']=get(JSON.parse(get(res,'attributes','"{}"')),'icon','icon-home');
        return res;
    });

    for( let val of array) {
        if(val['pid'] >0) {
            children.push(val);
        }
        else{
            fathers.push(val);
        }
    }
    for(let i = 0 ; i < fathers.length ; i++) {
        let tmp = [];
        for( let child of  children) {
            if(child['pid'] == fathers[i]['authRuleEntityId']) {
                tmp.push(child);
            }
        }
        if(tmp.length >0) fathers[i].childrens = tmp;
    }

    return fathers;
}


module.exports = function(opts = {}) {

    return async function auth(ctx,next) {
        //配置项中不需要走这个验证的情况下。
        if(get(opts,'authconfig.deactived',false)) {
            await next();
            return;
        }

         let userId = 2516582864;//ctx.cookies.get('userId');
         //其实应该先判断服务是否正确配置,再调用？
         let accountData = await grpc_services.AccountService.query({userIds:[userId]});
         let realName = get(accountData,'accounts[0]["cnName"]','default');
         //如果未能正常取得用户名则跳转
         if(realName == 'default') {
             ctx.status = 401;
             return ctx.redirect('http://www.baidu.com');//获取 跳转前url
          }
             console.log(realName);
        let authData = await grpc_services.AuthService.getMenuList({objectId:100});
        let menus = authData.menuList || [];

        ctx._httpContext = Object.assign({
            'menusData':[],
            'userInfo':realName
        },ctx._httpContext);
        await next();

    }
};