---
top: 2
sticky: 1000
sidebar:
  title: ref源码方法解读
  isTimeLine: true
title: ref源码方法解读
date: 2025-04-06
tags:
  - 前端
  - javascript
  - 源码
  - Vue3
categories:
  - 前端
---

# Vue 3 ref 源码方法解读：从使用到实现

在 Vue 3 中，`ref` 是 Composition API 的核心特性之一，用于创建响应式数据。它简单易用，但背后却蕴含了 Vue 响应式系统的精妙设计。本文将结合使用示例，深入剖析 `ref` 的源码实现，帮助你理解它的原理。

## 一、`ref` 的基本使用

先来看看 `ref` 的基本用法：

```javascript
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0) // 创建一个响应式引用
    const increment = () => {
      count.value++ // 通过 .value 修改值
    }

    return {
      count,
      increment,
    }
  },
}
```

在模板中，我们可以直接使用 `count`：

```html
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">加 1</button>
  </div>
</template>
```

运行这段代码，点击按钮时，`count` 会从 0 递增，并且页面会自动更新。表面上看，`ref` 只是一个简单的封装，但它是如何实现响应式的呢？接下来我们深入源码。

---

## 二、`ref` 的源码解读

Vue 3 的源码中，`ref` 的实现主要位于 `packages/reactivity/src/ref.ts` 文件中。我们逐步拆解其核心逻辑。

### 1. `ref` 函数的定义

`ref` 是一个工厂函数，接收一个初始值并返回一个 `Ref` 对象：

```typescript
function ref<T>(value?: T): Ref<T> {
  return createRef(value, false)
}
```

这里调用了内部的 `createRef` 函数，第二个参数 `false` 表示这不是 `shallowRef`（浅层响应式）。我们继续看 `createRef`：

```typescript
function createRef<T>(rawValue: T, shallow: boolean): Ref<T> {
  if (isRef(rawValue)) {
    return rawValue // 如果传入的是一个 ref，直接返回
  }
  return new RefImpl(rawValue, shallow)
}
```

`createRef` 首先检查传入的值是否已经是 `Ref` 类型（通过 `isRef` 判断），如果是则直接返回，否则创建一个 `RefImpl` 实例。

### 2. `RefImpl` 类：核心实现

`RefImpl` 是 `ref` 的核心实现类：

```typescript
class RefImpl<T> {
  private _value: T
  public dep?: Dep = undefined // 依赖收集的容器
  public readonly __v_isRef = true // 标记这是一个 ref

  constructor(value: T, public readonly _shallow: boolean) {
    this._value = _shallow ? value : toReactive(value) // 初始化值
  }

  get value() {
    trackRefValue(this) // 依赖收集
    return this._value
  }

  set value(newVal) {
    if (hasChanged(newVal, this._value)) {
      // 值发生变化时
      this._value = this._shallow ? newVal : toReactive(newVal)
      triggerRefValue(this) // 触发更新
    }
  }
}
```

#### 关键点解析：

- **属性**：

  - `_value`：存储实际的值。
  - `dep`：用于存储依赖（即哪些地方用到了这个 `ref`）。
  - `__v_isRef`：标记这是一个 `ref`，方便 `isRef` 判断。

- **构造函数**：

  - 如果是普通 `ref`（非浅层），会通过 `toReactive` 将值转为响应式对象（对于对象类型会调用 `reactive`）。
  - 如果是 `shallowRef`，则直接使用原始值。

- **`get value`**：

  - 当访问 `.value` 时，调用 `trackRefValue` 进行依赖收集。
  - 返回 `_value`。

- **`set value`**：
  - 当修改 `.value` 时，先通过 `hasChanged` 检查新旧值是否不同。
  - 如果不同，更新 `_value`，并通过 `triggerRefValue` 触发依赖更新。

### 3. 依赖收集与触发

- **`trackRefValue`**：

```typescript
function trackRefValue(ref) {
  if (shouldTrack && activeEffect) {
    ref.dep = ref.dep || new Dep()
    ref.dep.add(activeEffect)
  }
}
```

当 `ref.value` 被访问时，如果当前有活跃的 `effect`（如 `watchEffect` 或组件渲染），会将这个 `effect` 加入 `ref.dep` 中，实现依赖收集。

- **`triggerRefValue`**：

```typescript
function triggerRefValue(ref) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}
```

当 `ref.value` 被修改时，触发 `ref.dep` 中的所有依赖，通知它们更新。

---

## 三、结合使用示例深入理解

### 示例 1：基本计数器

回到开头的例子：

```javascript
const count = ref(0)
const increment = () => {
  count.value++
}
```

- **初始化**：`ref(0)` 创建一个 `RefImpl` 实例，`_value` 为 0。
- **访问**：模板中 `{{ count }}` 会触发 `get value`，收集渲染函数作为依赖。
- **修改**：`count.value++` 触发 `set value`，值变为 1，`triggerRefValue` 通知渲染函数更新页面。

### 示例 2：对象类型的 `ref`

`ref` 不仅支持基本类型，还支持对象：

```javascript
const user = ref({ name: 'Alice', age: 25 })

const updateAge = () => {
  user.value.age++ // 修改嵌套属性
}
```

- **初始化**：`toReactive` 将 `{ name: 'Alice', age: 25 }` 转为 `reactive` 对象。
- **访问**：`user.value.age` 会触发 `reactive` 的 getter，收集依赖。
- **修改**：`user.value.age++` 触发 `reactive` 的 setter，自动更新。

这里 `ref` 和 `reactive` 的结合非常巧妙，`ref` 的 `_value` 是一个 `reactive` 对象，嵌套属性的响应式由 `reactive` 接管。

---

## 四、注意事项与源码启发

1. **`.value` 的必要性**：

   - 在 `setup` 中需要手动写 `.value`，但模板中不需要，因为 Vue 在编译时会自动解包 `ref`。
   - 源码中，`ref` 的设计是为了在 JS 中保持显式性。

2. **性能优化**：

   - `hasChanged` 避免了不必要的更新。
   - `shallowRef` 提供了浅层响应式选项，适合大数据场景。

3. **与 `reactive` 的区别**：
   - `ref` 适用于单一值或需要显式解包的场景。
   - `reactive` 更适合复杂对象，省去 `.value`。

---

## 五、总结

通过源码分析，我们看到 `ref` 的实现并不复杂，但它巧妙地结合了 getter/setter 和依赖收集机制，实现了响应式。无论是基本类型还是对象，`ref` 都能无缝衔接 Vue 的响应式系统。希望这篇文章能帮助你更深入地理解 `ref`，并在实际开发中更自信地使用它！
