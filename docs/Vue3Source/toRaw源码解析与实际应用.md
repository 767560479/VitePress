---
top: 10
sticky: 1000
sidebar:
  title: toRaw源码解析与实际应用
  isTimeLine: true
title: toRaw源码解析与实际应用
date: 2025-04-12
tags:
  - 前端
  - javascript
  - 源码
  - Vue3
categories:
  - 前端
---

以下是一篇关于 Vue 3 中 `toRaw` 方法的源码实现及其在实际项目中应用的博客，内容涵盖了技术细节和实用场景：

---

# `toRaw`方法：源码解析与实际应用

Vue 3 作为前端开发中广受欢迎的框架，其响应式系统是核心特性之一。通过 Proxy 和 reactive/ref 等 API，Vue 实现了数据的动态追踪和更新。然而，在某些场景下，我们需要绕过响应式，直接访问原始数据，这时 `toRaw` 方法就派上了用场。本文将深入剖析 `toRaw` 的源码实现，并结合实际项目探讨其应用场景。

## 一、`toRaw` 方法的作用

在 Vue 3 中，`reactive` 和 `ref` 创建的响应式对象本质上是原始对象的代理（Proxy）。这些代理对象在读写时会触发依赖收集和更新，但有时我们需要访问原始数据本身，而不是代理对象。例如：

- 需要传递数据给外部库，而外部库不理解 Proxy。
- 需要对比原始数据和修改后的数据。
- 优化性能，避免不必要的响应式追踪。

`toRaw` 方法的作用就是从响应式对象中提取其原始数据。它接受一个响应式对象（由 `reactive` 或 `ref` 创建），返回对应的原始对象。

### 示例

```javascript
import { reactive, toRaw } from 'vue'

const rawObj = { name: 'Vue' }
const reactiveObj = reactive(rawObj)

console.log(reactiveObj === rawObj) // false，reactiveObj 是 Proxy
console.log(toRaw(reactiveObj) === rawObj) // true，toRaw 返回原始对象
```

## 二、`toRaw` 的源码实现

`toRaw` 的实现位于 Vue 3 的 `reactivity` 模块中，我们可以从源码角度深入理解其工作原理。以下是简化后的核心实现（基于 Vue 3.4.x 版本，具体细节可能因版本略有差异）：

### 源码位置

`toRaw` 定义在 `packages/reactivity/src/reactive.ts` 中：

```typescript
export function toRaw<T>(observed: T): T {
  // 如果传入的对象有 __v_raw 属性，则返回其原始对象
  const raw = observed && (observed as any).__v_raw
  // 如果存在 raw，则递归调用 toRaw，否则返回 observed
  return raw ? toRaw(raw) : observed
}
```

### 实现原理

1. **检查 `__v_raw` 属性**：

   - Vue 在创建响应式对象时，会在 Proxy 上添加一个隐藏属性 `__v_raw`，它指向原始对象。
   - `toRaw` 首先检查传入的对象是否存在 `__v_raw`，如果存在，说明这是一个 Proxy。

2. **递归处理**：

   - 如果存在 `__v_raw`，`toRaw` 会递归调用自身，传入 `__v_raw` 的值，直到找到真正的原始对象。
   - 这种递归设计是为了处理嵌套响应式对象的情况。

3. **直接返回**：
   - 如果传入的对象没有 `__v_raw`（即不是响应式对象），则直接返回原对象。

### 源码中的上下文

在 Vue 的响应式系统中，`reactive` 的实现依赖于 WeakMap 来存储原始对象和 Proxy 的映射关系：

```typescript
const rawToReactive = new WeakMap<any, any>()
const reactiveToRaw = new WeakMap<any, any>()

function reactive(target: object) {
  // 如果已经是 Proxy，直接返回
  if (isReadonly(target)) {
    return target
  }
  // 检查缓存
  const existingProxy = rawToReactive.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // 创建 Proxy
  const proxy = new Proxy(target, mutableHandlers)
  rawToReactive.set(target, proxy)
  reactiveToRaw.set(proxy, target)
  return proxy
}
```

`toRaw` 通过 `__v_raw` 或直接访问原始对象，利用了这种映射关系。值得注意的是，`__v_raw` 是 Vue 内部使用的标记，开发者无法直接访问。

## 三、在实际项目中的应用

`toRaw` 虽然是个小工具，但在特定场景下非常实用。以下是几个常见的应用案例：

### 1. 与第三方库集成

许多第三方库（如 Lodash、Axios 等）不理解 Proxy 对象。如果直接将 `reactive` 对象传入，可能会导致错误或意外行为。这时可以用 `toRaw` 获取原始数据。

```javascript
import { reactive, toRaw } from 'vue'
import _ from 'lodash'

const state = reactive({ list: [1, 2, 3] })
// 使用 Lodash 操作原始数据
const rawState = toRaw(state)
const cloned = _.cloneDeep(rawState)
console.log(cloned) // { list: [1, 2, 3] }
```

### 2. 数据对比与调试

在开发中，我们可能需要对比数据修改前后的状态。直接对比 `reactive` 对象会因为 Proxy 而变得复杂，使用 `toRaw` 可以简化操作。

```javascript
import { reactive, toRaw } from 'vue'

const original = { count: 0 }
const state = reactive(original)

state.count = 10
console.log(toRaw(state).count) // 10
console.log(original.count) // 10，原始对象也被修改
console.log(toRaw(state) === original) // true
```

### 3. 性能优化

在某些场景下，我们需要临时禁用响应式追踪以提升性能。例如，批量更新数据时：

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({ items: [] })
// 批量更新，避免触发多次响应式更新
const rawItems = toRaw(state).items
for (let i = 0; i < 1000; i++) {
  rawItems.push(i) // 直接操作原始数组
}
```

注意：这种方式会直接修改原始数据，需谨慎使用，确保不会破坏响应式系统的完整性。

### 4. 处理嵌套对象

对于嵌套的响应式对象，`toRaw` 也能正确处理：

```javascript
import { reactive, toRaw } from 'vue'

const raw = { nested: { value: 1 } }
const state = reactive(raw)
state.nested.value = 2

const rawState = toRaw(state)
console.log(rawState.nested.value) // 2
console.log(rawState === raw) // true
```

## 四、使用注意事项

1. **不可逆性**：

   - `toRaw` 返回的对象是非响应式的，后续修改不会触发视图更新。如果需要保持响应式，应操作原始的 `reactive` 对象。

2. **仅适用于 Vue 的响应式对象**：

   - 如果传入普通对象，`toRaw` 直接返回原对象，不会报错，但也没有特殊效果。

3. **调试用途**：
   - 在开发中，`toRaw` 是调试响应式对象的利器，可以帮助开发者快速定位问题。

## 五、总结

`toRaw` 是 Vue 3 提供的一个简单却强大的工具，其源码实现利用了 `__v_raw` 属性和递归逻辑，优雅地解决了从响应式对象到原始对象的转换问题。在实际项目中，它在与第三方库集成、数据对比、性能优化等场景中都有广泛应用。

通过理解 `toRaw` 的原理和使用方法，我们可以更灵活地驾驭 Vue 的响应式系统，编写出更高效、更健壮的代码。希望这篇文章能帮助你更好地掌握这一工具，并在项目中找到它的用武之地！
