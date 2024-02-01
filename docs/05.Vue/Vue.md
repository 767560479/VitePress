# 05.Vue



##  router.beforeResolve 和router.beforeEach 有什么相同点和不同点

在 Vue 2 中，`router.beforeResolve` 和 `router.beforeEach` 都是路由钩子函数，它们在路由跳转过程中被调用，但是它们的触发时机和用途有所不同。以下是它们的相同点和不同点：
相同点：
1. 都是路由钩子函数：它们都可以用来在路由跳转前后执行一些代码逻辑。
2. 都可以访问 `to`、`from` 和 `next` 参数：其中 `to` 表示即将要进入的目标路由对象，`from` 表示当前导航正要离开的路由，`next` 是一个函数，必须调用它来解析这个钩子。
不同点：
1. 触发时机：`router.beforeEach` 在每次路由跳转时都会被调用，而 `router.beforeResolve` 在路由解析组件异步路由的时候被调用，也就是在 `beforeEach` 之后，`beforeRouteEnter` 之前被调用。简单来说，`beforeEach` 是在路由切换的开始阶段被调用，而 `beforeResolve` 则是在组件渲染之前被调用。
2. 应用场景：`router.beforeEach` 通常用于全局的导航守卫，比如登录检查、权限验证等。`router.beforeResolve` 则可以用来处理一些需要在组件渲染之前完成的逻辑，例如数据预加载等。
在实际开发中，可以根据实际需求选择合适的钩子函数来处理不同的逻辑。

