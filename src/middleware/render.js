/**
 * Created by joe on 16/9/23.
 */


import fs from 'fs';
const Path = require('path');
const renderer = require('vue-server-renderer').createRenderer();
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer;
const cache = {};
const pageLoader = require('../util/pageLoader');


const renderPromise = function (pageName, code, context) {
    return new Promise(function (resolve, reject) {
        let cr = cache[pageName];
        if (!cr || !pageLoader.isProduction()) {
            cr = createBundleRenderer(code);
            cache[pageName] = cr;
        }
        cr.renderToString(context, (err, html) => {
            if (err) return reject(err);
            resolve(html);
        });
    });
};


export default function (opts = {}) {

    const layouts = opts.layouts || Path.join(opts.root, "layouts");
    if (!opts.isProduction) {
        pageLoader.initCompile();
    }

    return async function render(ctx, next) {

        if (!ctx.context) {
            await next();
            return;
        }

        const pageContext = ctx.context.pageContext;

        let body = fs.readFileSync(Path.join(layouts, ctx.context.layout||"default.html")).toString();
        body = body.replace('{{ title }}', ctx.context.title || "hello pomjs!");
        body = body.replace('{{ keywords }}', ctx.context.keywords || "");
        body = body.replace('{{ description }}', ctx.context.description || "");


        const scriptName = pageContext.pageName + ".bundle.js";
        const script = "/bundle/" + scriptName;

        const contextData = "var __vue_context_data=" + JSON.stringify(ctx.context) + ";";
        const sr = " <script>" + contextData + "</script>\n <script src='" + script + "'></script>";
        body = body.replace('{{ page.js }}', sr);

        if (process.env.NODE_ENV !== 'production') {
            await pageLoader.compileRun();
        }

        let html = await renderPromise(scriptName, pageLoader.readServerFileSync(scriptName), ctx.context);

        if(ctx.dingTalk){
          html += `
          <script src="http://g.alicdn.com/dingding/open-develop/0.8.4/dingtalk.js"></script>
          <script>
            dd.config({
              agentId: 123,
              corpId: '${ctx.dingTalk.corpid}',
              timeStamp: '${ctx.dingTalk.timestamp}',
              nonceStr: '${ctx.dingTalk.noncestr}',
              signature: '${ctx.dingTalk.signature}',
              jsApiList: [
                  'runtime.info',
                  'device.notification.prompt',
                  'biz.chat.pickConversation',
                  'device.notification.confirm',
                  'device.notification.alert',
                  'device.notification.prompt',
                  'biz.chat.open',
                  'biz.util.open',
                  'biz.user.get',
                  'biz.contact.choose',
                  'biz.telephone.call',
                  'biz.ding.post']
            });
            dd.ready(function() {
              dd.runtime.info({
                  onSuccess: function(info) {
                      console.info('runtime info: ' + JSON.stringify(info));
                  },
                  onFail: function(err) {
                      console.error('fail: ' + JSON.stringify(err));
                  }
              });
            });
            dd.error(function(error){
              alert('dd error: ' + JSON.stringify(err));
            });
          </script>
          `
        }

        body = body.replace('{{ html }}', html);

        if (process.env.NODE_ENV === 'production'){
          body = body.replace('{{ stylesheet }}', "<link href='/bundle/"+pageContext.pageName+".style.css' rel='stylesheet'></link>")
        }else{
          const styles = pageLoader.readClientFile(pageContext.pageName+".style.css").toString()
          body = body.replace('{{ stylesheet }}', "<style rel='stylesheet'>"+styles+"</style>")
        }

        ctx.body = body;

        ctx.type = 'text/html; charset=utf-8';

    }
}
