<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2024-07-02 14:38:45
 * @FilePath: \VitePress\docs\01.JavaScript\浅析script标签下的async和defer.md
 * @LastEditors: zhengfei.tan
 * @LastEditTime: 2024-07-02 14:41:30
-->

# 浅析 script 标签下的 async 和 defer

前言：

在 HTML 中，`<script>`标签用于引入外部的 JavaScript 文件。它可以通过`async`和`defer`属性来控制脚本的加载方式。本文将介绍这两个属性的区别以及如何使用它们。

1.  async 属性

`async`属性用于异步加载脚本，即在不影响页面其他内容的情况下加载脚本。当脚本加载完成后，会立即执行脚本。

比较特别，因为在下载后会立刻执行，且不保证执行顺序，一般常见的应用是设定在完全独立的小小模块中，例如背景 Logo、页面广告等，在避免造成使用者体验变差的同时，尽量早的产生效果

```html
<script async src="script.js"></script>
```

2.  defer 属性

`defer`属性用于延迟加载脚本，即在页面加载完成后再加载脚本。当脚本加载完成后，会在 DOMContentLoaded 事件之前执行脚本。

```html
<script defer src="script.js"></script>
```

3.  区别

- `async`属性：脚本加载完成后立即执行，不阻塞页面的渲染。
- `defer`属性：脚本加载完成后在 DOMContentLoaded 事件之前执行，阻塞页面的渲染。
