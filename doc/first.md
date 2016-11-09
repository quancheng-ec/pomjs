
## 背景介绍

pomjs 的web server是基于KOA2来处理的，不了解的可以参见KOA2的文档 https://github.com/koajs/koa/blob/2.0.0/docs/api/index.md

为了更好的服务前台，pomjs提倡基于模块化的思想来构建应用，既可以用vue ssr方式进行服务端渲染也可以node api+vue前端方式

### 1. 基础约定

pomjs 对代码结构是有一些约定的。如下

```

|--config           | pomjs 全局配置信息
|----index.js       | 具体的配置文件,后面有详细介绍
|--layouts          | 布局信息
|----default.html   | 默认的布局文件
|----admin.html     | 其他的布局文件
|--src              | 源码
|----pages          | 页面模块
|------index        | 首页，默认的页面
|--------index.js   | node api，执行服务端逻辑
|--------xx.vue     | 各种view视图
|------hello        | hell页面
|--------index.js    
|--------xx.vue
|--static           | 静态资源目录 
|----xxx            | 静态资源 
|--.babelrc         | babel 配置
|--package.json     | 不解释

```


#### 1.1 config 

##### index.js
```
/**
 * Created by joe on 2016/10/15.
 */

const path = require('path');
const opts = {
    static: path.join(__dirname, '../static'),// 静态文件目录
    layout: path.join(__dirname, '../layouts'),// layout文件目录
    page: {
        src: path.join(__dirname, '../src/pages'),//页面模块的源码路径 默认即可
        build: path.join(__dirname, '../dist/pages') // 页面的编译路径 默认即可
    },
    root: path.join(__dirname, '../'),// 当前应用的根目录
    port: 3000,//端口  
    saluki: {// 非必须参数
        root:path.join(__dirname,'../node_modules/quancheng-service-api/src/main/proto'),// PB的定义文件路径
        group: 'Default',// 环境分组信息
        host: 'doamin',// saluki的注册中心地址
        port: '8500',//saluki的注册中心端口
        services: {
            helloService: 'com.quancheng.examples.service.HelloService:Default:1.0.0' // name:serviceName:serviceGroup:serviceVersion
        }
    }
}

module.exports = opts;

```
saluki 是基于grpc的商用解决方案，这里需要提供注册中心、pb定义目录，以及要声明service

##### 注意：
修改config信息需要重新启动

#### 1.2 layout
 
```

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- Tell the browser to be responsive to screen width -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="keywords" content="{{ keywords }}">
    <meta name="description" content="{{ description }}">
    <title>{{ title }}</title>
</head>
<body>
{{ html }}

{{ page.js }}

</body>
</html>

```

可以看到 模板接收几个参数

keywords: 网页的关键字，seo用 可以不填写

description: 网页的描述，seo用 可以不填写

title: 必须参数 网页的title

html: 必须参数 渲染内容 动态生成

page.js: 必须参数 前端js 动态生成 


title、description、keywords 可以在api的返回模型里包含该字段，就可以反映到前台上

```
    view(ctx) {

        return {
            title:'hello'
        }
    }
```

#### 1.3 src


