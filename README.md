# pomjs

基于Koa2+vue2+webpack的node解决方案，主要feature:

1. 默认集成 session（支持cookie、redis）
2. 默认集成 route，以REST API方式提供服务
3. 提供了data模块，支持数据源自定义接入
4. 提供GRPC完整解决方案，集成saluki
5. 完善的日志监控体系
6. 支持调用链路监控




## Route

route模块主要请求转发和执行

pomjs 支持几种资源的加载

1. static 静态资源

html,css,js,png等图片格式

为了对cdn更友好，pomjs在访问路径上做了约定，加上固定前缀:static

```
http://localhost/static/**.html

http://localhost/static/**.css
http://localhost/static/**.js
http://localhost/static/**.png
```



2. API请求

遵循规则  api/xxx

```
##http://localhost/api/***

http://localhost/api/hello --》pages/index/index.js hello()
http://localhost/api/user/get --》pages/user/index.js get()

```

3. SSR

服务端渲染会先执行API Control，然后执行vue渲染

```

http://localhost/user/login --》pages/user/index.js.login() + pages/user/login.vue
http://localhost/user|/ --》pages/index/index.js.user() + pages/index/user.vue

```


