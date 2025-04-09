---
top: 2
sticky: 1000
sidebar:
  title: reactive的源码解读
  isTimeLine: true
title: reactive的源码解读
date: 2025-04-06
tags:
  - 前端
  - javascript
  - 源码
  - Vue3
categories:
  - 前端
---

# Vue 3 `reactive` 源码方法解读：从使用到实现

在 Vue 3 的 Composition API 中，`reactive` 是创建响应式对象的核心工具。与 `ref` 专注于单一值的响应式不同，`reactive` 更适合处理复杂对象，让对象的每个属性都具备响应式能力。本文将结合使用示例，深入剖析 `reactive` 的源码实现，带你理解其背后的原理。

## 一、`reactive` 的源码解读

`reactive` 的核心实现位于 `packages/reactivity/src/reactive.ts` 文件中，基于 ES6 的 `Proxy` 实现响应式。我们逐步拆解其关键部分。

### 1. `reactive` 函数的定义

`reactive` 是一个工厂函数，接收一个对象并返回其响应式代理：

```typescript
function reactive<T extends object>(target: T): T {
  if (isReadonly(target)) {
    return target // 如果是只读对象，直接返回
  }
  return createReactiveObject(
    target,
    false, // 是否只读
    mutableHandlers, // 可变代理处理器
    mutableCollectionHandlers // 集合类型处理器
  )
}
```

这里调用了 `createReactiveObject` 函数，传入目标对象和一组处理器。我们继续看 `createReactiveObject`：

```typescript
function createReactiveObject(
  target: any,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  if (!isObject(target)) {
    return target // 不是对象，直接返回
  }

  // 如果已经是一个代理对象，直接返回
  if (target.__v_raw && !(isReadonly && target.__v_isReactive)) {
    return target
  }

  const proxyMap = isReadonly ? readonlyProxyMap : reactiveProxyMap
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy // 避免重复代理
  }

  const proxy = new Proxy(
    target,
    isArray(target) || isSet(target) || isMap(target) ? collectionHandlers : baseHandlers
  )
  proxyMap.set(target, proxy) // 缓存代理
  return proxy
}
```

#### 关键点解析：

- **输入检查**：确保传入的是对象，并且不是已代理的对象。
- **代理类型**：普通对象使用 `mutableHandlers`，集合类型（如数组、Set、Map）使用 `mutableCollectionHandlers`。
- **缓存机制**：通过 `reactiveProxyMap` 避免同一对象重复创建代理。

### 2. `mutableHandlers`：核心代理逻辑

`mutableHandlers` 定义了 `Proxy` 的行为，主要包括 `get` 和 `set` 两个陷阱：

#### `get` 方法

```typescript
const get = createGetter(false)

function createGetter(isReadonly: boolean) {
  return function get(target: any, key: string | symbol, receiver: any) {
    if (key === '__v_isReactive') {
      return !isReadonly // 标记为响应式
    }
    if (key === '__v_raw') {
      return target // 返回原始对象
    }

    const res = Reflect.get(target, key, receiver)

    if (!isReadonly) {
      track(target, 'get', key) // 依赖收集
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res) // 深层响应式
    }
    return res
  }
}
```

- **依赖收集**：访问属性时，调用 `track` 将当前 `effect` 加入依赖。
- **深层响应式**：如果属性值是对象，递归调用 `reactive` 使其也变成响应式。

#### `set` 方法

```typescript
const set = createSetter()

function createSetter() {
  return function set(target: any, key: string | symbol, value: any, receiver: any) {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)

    if (hasChanged(value, oldValue)) {
      trigger(target, 'set', key) // 触发更新
    }
    return result
  }
}
```

- **值更新**：使用 `Reflect.set` 修改属性。
- **触发更新**：如果值发生变化，调用 `trigger` 通知依赖。

### 3. 依赖收集与触发

- **`track`**：

```typescript
function track(target: any, type: string, key: any) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = new Set()))
    }
    dep.add(activeEffect)
  }
}
```

记录哪些 `effect` 依赖了某个对象的某个属性。

- **`trigger`**：

```typescript
function trigger(target: any, type: string, key: any) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (dep) {
    triggerEffects(dep)
  }
}
```

通知所有依赖该属性的 `effect` 执行更新。

---

## 二、结合使用示例深入理解

### 示例 1：基本计数器

回到开头的例子：

```javascript
const state = reactive({ count: 0 })
const increment = () => {
  state.count++
}
```

- **初始化**：reactive 创建一个 `Proxy`，代理 count: 0 。
- **访问**：state.count 触发 `get`，收集渲染函数作为依赖。
- **修改**：state.count++ 触发 `set`，通知渲染函数更新。

### 示例 2：嵌套对象

`reactive` 支持深层响应式：

```javascript
const state = reactive({
  user: {
    name: 'Bob',
    info: { age: 30 },
  },
})

const updateAge = () => {
  state.user.info.age++
}
```

- **初始化**：`state.user` 和 `state.user.info` 都被递归代理为 `reactive`。
- **访问**：`state.user.info.age` 触发多层 `get`，收集依赖。
- **修改**：`state.user.info.age++` 触发 `set`，自动更新。

---

## 三、注意事项与源码启发

1. **与 `ref` 的区别**：

   - `reactive` 适合复杂对象，无需 `.value`，但只适用于对象。
   - `ref` 更灵活，支持基本类型，但需要显式解包。

2. **性能优化**：

   - `reactiveProxyMap` 缓存避免重复代理。
   - `hasChanged` 减少不必要的触发。

3. **局限性**：
   - 不能直接替换整个对象（如 state = { count: 1 } ），需要修改属性。
   - 解决方案：使用 `reactive` 包裹新对象，或结合 `ref`。

---

## 四、总结

`reactive` 通过 `Proxy` 实现了对象的全方位响应式，结合依赖收集和触发机制，为 Vue 3 提供了强大的数据驱动能力。它的深层响应式设计和性能优化让人叹服。理解了 `reactive` 的原理，你就能更灵活地运用它构建复杂应用。

如果你对 Vue 3 的其他特性感兴趣，欢迎留言交流！

---

点击按钮时，`state.count` 增加，页面自动更新。相比 `ref`，`reactive` 不需要 `.value`，操作更直观。接下来，我们深入源码，看看它是如何实现的。

---

`reactive` 通过 `Proxy` 实现了对象的全方位响应式，结合依赖收集和触发机制，为 Vue 3 提供了强大的数据驱动能力。它的深层响应式设计和性能优化让人叹服。理解了 `reactive` 的原理，你就能更灵活地运用它构建复杂应用。
