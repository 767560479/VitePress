# 05.Vue

## Vue 基本原理

当一个 Vue 实例创建时，Vue 会遍历 data 对象中的属性，使用 Object.defineProperty()【vue3.0 使用 proxy】将它们转为 getter/setter。当页面使用这些属性时，getter 会被调用，并返回属性值；当修改这些属性时，setter 会被调用，并设置属性的值， 并且还会在内部追踪相关依赖，在属性被访问和修改时通知变化。每个组件实例都有相对应的 watcher 实例对象，它会在组件渲染的过程中把属性记录为依赖，之后当依赖项的 setter 被调用时，会通知 watcher 重新计算，从而致使它关联的组件得以更新。

## 双向数据绑定的原理

Vue 是采用数据劫持结合发布者订阅者模式的方式，实现数据双向绑定的。通过 Object.defineProperty() 来劫持各个属性的 setter，getter，在数据变动时通知订阅者，触发相应的监听回调。

主要分为一下几个步骤：

1. 需要 observe 的数据对象进行递归遍历，包括子属性对象的属性，都加上 setter 和 getter。这样的话，给这个对象的某一个属性赋值，就会触发 setter，那么就能监听到了数据变化
2. compile 解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图
3. Watcher 订阅者是 Observer 和 Compile 之间通信的桥梁，主要做的事情是: 1、在自身实例化时向属性订阅器（dep）里面添加自己 2、自身必须有一个 update() 方法 3、待属性变动 dep.notice() 通知时，能调用自身的 update() 方法，并触发 Compile 中绑定的回调。
4. MVVM 作为数据绑定的入口，整合 Observer、Compile 和 Watcher 三者，通过 Observer 来监听自己的 model 数据变化，通过 Compile 来解析编译模板指令，最终利用 Watcher 搭起 Observer 和 Compile 之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化（input）-> 数据 model 变更的双向绑定效果。

## slot 是什么？有什么作用？原理是什么?

slot 又名插槽，是 Vue 的内容分发机制，组件内部的模板引擎使用 slot 元素作为承载分发内容的出口。插槽 slot 是子组件的一个模板 标签元素，而这一个标签元素是否显示，以及怎么显示是由父组件决 定的。slot 又分三类，默认插槽，具名插槽和作用域插槽。

默认插槽：又名匿名插槽，当 slot 没有指定 name 属性值的时候一个 默认显示插槽，一个组件内只有有一个匿名插槽。具名插槽：带有具体名字的插槽，也就是带有 name 属性的 slot，一 个组件可以出现多个具名插槽。

作用域插槽：默认插槽、具名插槽的一个变体，可以是匿名插槽，也 可以是具名插槽，该插槽的不同点是在子组件渲染作用域插槽时，可 以将子组件内部的数据传递给父组件，让父组件根据子组件的传递过 来的数据决定如何渲染该插槽。

实现原理： 当子组件 vm 实例化时，获取到父组件传入的 slot 标签内容。存放在 vm.$slot 中，默认插槽为 vm.$slot.default，具名插 槽为 vm.$http://slot.xxx，xxx 为插槽名，当组件执行渲染函数时候，遇 到 slot 标签，使用$slot 中的内容进行替换，此时可以为插槽传递 数据，若存在数据，则可称该插槽为作用域插槽。

## $nextTick 原理及作用

Vue 的 nextTick 其本质是对 Javascript 执行原理 Event Loop 的运用。

nextTick 的核心是利用了如 Promise，MutationObserver,setImmediate,setTimeout 等原生 JavaScript 方法来模拟对应的微/宏任务的实现。本质是为了利用 Javascript 的这些异步回调队列任务实现 Vue 框架中自己的回调队列

nextTick 不仅仅是 Vue 内部的异步队列的调用方法，同时也是允许开发者在实际项目中使用这个方法来满足对 DOM 更新数据时机的后续逻辑处理。

nextTick 是典型的将底层 Javascript 执行机制应用到 Vue 框架中的一个例子。引入异步更新队列机制的原因：如果是同步更新，则多次对一个或者多个属性赋值，会频繁触发 DOM 的更新，影响性能。

## Vue 中封装的数组方法有哪些，其如何实现页面的更新

push()、pop()、shift()、unshift()、splice()、sort()、reverse()

在 Vue 中，对响应式处理利用的是 Object.defineProperty()方法对数据进行拦截，而这个方法不能监听数组的变化，所以 Vue 封装了数组方法，在调用这些方法时，会触发 Vue 的更新机制，从而实现对数组的更新。

Vue 是如何实现让这些数组方法实现元素的实时更新的，

```javascript
// 缓存数组原型
let oldArrayProto = Array.prototype
export const arrayMethods = Object.create(oldArrayProto)
const methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
methodsToPatch.forEach(function (method) {
  // 缓存原始的方法
  const original = arrayMethods[method]
  def(arrayMethods, method, function mutator(...args) {
    // 执行并缓存原生数组的功能
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      // 如果是 splice 方法，如果传入第三个方法参数，也会有索引加入，所以也要手动进行观测
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 如果有新插入的元素，则进行观测
    if (inserted) ob.observeArray(inserted)
    // 通知更新
    ob.dep.notify()
    // 放回原生数组的执行结果
    return result
  })
})
```

简单来说就是，重写了数组中的那些原生方法，首先获取到这个数据的**ob**属性，然后通过**ob**属性获取到 dep 实例，如果有新值，就调用 observeArray 方法，将新值进行观测，然后调用 dep 实例的 notify 方法，通知更新。

## Vue data 中某一个属性的值发生变化后，视图会立即同步执行重新渲染吗？

不会，Vue 中的数据响应式是通过依赖收集和发布订阅模式实现的，当数据发生变化时，会触发相应的依赖更新，然后才会执行重新渲染。

如果同一个 watcher 被多次触发，Vue 会进行去重处理，只执行一次重新渲染。

## Vue 模板编译原理

Vue 中的模板 template 无法被浏览器解析并渲染，因为这个不属于浏览器的标准，所以需要将 template 转换为 JavaScript 可执行的代码，这个过程就是模板编译。模板编译又分为三个阶段

1. 解析阶段（parse）
   将 template 模板转换为 AST（抽象语法树）
2. 优化阶段（optimize）
   对 AST 进行优化，标记静态节点，优化后的 AST 可以进行静态打标，静态打标可以提高渲染性能
3. 生成阶段（generate）
   将优化后的 AST 转换成 render function 字符串

## 对 Vue 设计原则的理解

1. 渐进式 javascript 框架: 与其他大型框架不同的是，Vue 被设计为可以自底向上逐层应用。Vue 的核心库只关注视图层，不仅易于上手，还便于与其他库或已有项目整合。另一方面，当与单文件组件和 Vue 生态系统支持的库结合使用时，Vue 也完全能够为大型应用提供驱动。
2. 易用性：vue 提供数据响应性、声明式模板语法和基于配置的组件系统等核心特性。这些特性使得 Vue 易于学习、易于集成和易于使用。
3. 灵活性：Vue 允许用户使用自定义的组件和指令来扩展其功能。用户还可以使用 Vue 的插件系统来扩展其功能。
4. 高效性：超快的虚拟 DOM 和 diff 算法使我们的应用拥有最佳的性能 表现。追求高效的过程还在继续，vue3 中引入 Proxy 对数据响应式 改进以及编译器中对于静态内容编译的改进都会让 vue 更加高效。

## router.beforeResolve 和 router.beforeEach 有什么相同点和不同点

在 Vue 2 中，`router.beforeResolve` 和 `router.beforeEach` 都是路由钩子函数，它们在路由跳转过程中被调用，但是它们的触发时机和用途有所不同。以下是它们的相同点和不同点：
相同点：

1. 都是路由钩子函数：它们都可以用来在路由跳转前后执行一些代码逻辑。
2. 都可以访问 `to`、`from` 和 `next` 参数：其中 `to` 表示即将要进入的目标路由对象，`from` 表示当前导航正要离开的路由，`next` 是一个函数，必须调用它来解析这个钩子。
   不同点：
3. 触发时机：`router.beforeEach` 在每次路由跳转时都会被调用，而 `router.beforeResolve` 在路由解析组件异步路由的时候被调用，也就是在 `beforeEach` 之后，`beforeRouteEnter` 之前被调用。简单来说，`beforeEach` 是在路由切换的开始阶段被调用，而 `beforeResolve` 则是在组件渲染之前被调用。
4. 应用场景：`router.beforeEach` 通常用于全局的导航守卫，比如登录检查、权限验证等。`router.beforeResolve` 则可以用来处理一些需要在组件渲染之前完成的逻辑，例如数据预加载等。
   在实际开发中，可以根据实际需求选择合适的钩子函数来处理不同的逻辑。

## Vue3.0 为什么要用 proxy？

```
在 Vue2 中， 0bject.defineProperty 会改变原始数据，而 Proxy 是创建对象的虚拟表示，并提供 set 、get 和 deleteProperty 等 处理器，这些处理器可在访问或修改原始对象上的属性时进行拦截，有以下特点∶

不需用使用 Vue.$set 或 Vue.$delete 触发响应式。

全方位的数组变化检测，消除了 Vue2 无效的边界情况。

支持 Map，Set，WeakMap 和 WeakSet。

Proxy 实现的响应式原理与 Vue2 的实现原理相同，实现方式大同小 异∶

get 收集依赖

Set、delete 等触发依赖

对于集合类型，就是对集合对象的方法做一层包装：原方法执行后执 行依赖相关的收集或触发逻辑。
```

## 虚拟 DOM 的解析过程

```
虚拟 DOM 的解析过程：

首先对将要插入到文档中的 DOM 树结构进行分析，使用 js 对象将 其表示出来，比如一个元素对象，包含 TagName、props 和 Children

这些属性。然后将这个 js 对象树给保存下来，最后再将 DOM 片段 插入到文档中。

当页面的状态发生改变，需要对页面的 DOM 的结构进行调整的时候，首先根据变更的状态，重新构建起一棵对象树，然后将这棵新的对象 树和旧的对象树进行比较，记录下两棵树的的差异。

最后将记录的有差异的地方应用到真正的 DOM 树中去，这样视图就 更新了。
```

## DIFF 算法的原理

```
在新老虚拟 DOM 对比时：

首先，对比节点本身，判断是否为同一节点，如果不为相同节点，则 删除该节点重新创建节点进行替换

如果为相同节点，进行 patchVnode，判断如何对该节点的子节点进 行处理，先判断一方有子节点一方没有子节点的情况(如果新的 children 没有子节点，将旧的子节点移除)

比较如果都有子节点，则进行 updateChildren，判断如何对这些新 老节点的子节点进行操作（diff 核心）。

匹配时，找到相同的子节点，递归比较子节点

在 diff 中，只对同层的子节点进行比较，放弃跨级的节点比较，使 得时间复杂从 O(n 3)降低值 O(n)，也就是说，只有当新旧 children 都为多个子节点时才需要用核心的 Diff 算法进行同层级比较。
```
