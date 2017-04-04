## 插件体系

pomjs 默认提供了一整套基础插件同时支持插件扩展。

pomjs 插件在启动的时候，读取 config的plugins参数，并自动加载插件集合.
插件的名称需要和文件名一致，不需要填写 .js后缀

如：

```
 {
     plugins:['hello','cors']
 }

```



