---
top: 2
sticky: 1000
sidebar:
  title: computed源码解读与使用示例
  isTimeLine: true
title: computed源码解读与使用示例
date: 2025-04-07
tags:
  - 前端
  - javascript
  - 源码
  - Vue3
categories:
  - 前端
---

# computed 源码解读与使用示例

在 Vue 3 中，`computed` 是响应式编程中非常核心的功能之一。它允许开发者定义基于其他响应式数据的计算属性，并确保在依赖变化时自动更新。本文将结合使用示例，深入剖析 `computed` 的源码实现，带你了解其背后的魔法。

## 一、`computed` 的基本用法

在 Vue 3 中，`computed` 是一个 API，用于创建计算属性。我们通常在 `setup` 函数或 Composition API 中使用它。以下是一个简单示例：

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(1)
    const double = computed(() => count.value * 2)

    return { count, double }
  },
}
```

在这个例子中：

- `count` 是一个 `ref` 响应式变量，初始值为 `1`。
- `double` 是一个计算属性，它的值依赖于 `count`，始终是 `count.value` 的两倍。
- 当 `count.value` 改变时，`double` 会自动重新计算。

在模板中使用时：

```html
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ double }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>
```

点击按钮时，`count` 增加，`double` 会同步更新。这一切看似简单，但背后依赖于 Vue 的响应式系统和 `computed` 的实现。

## 二、`computed` 的源码解读

Vue 3 的 `computed` 源码位于 `packages/reactivity/src/computed.ts` 中。我们将逐步拆解其核心实现。

### 1. `computed` 函数的入口

`computed` 是一个工厂函数，接收一个 getter 函数（或选项对象），返回一个 `ComputedRef` 对象。源码如下：

```typescript
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | ComputedOptions<T>
): ComputedRef<T> {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>

  // 判断传入的是 getter 函数还是选项对象
  const onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {
      console.warn('Write operation failed: computed value is readonly')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  // 创建 ComputedRefImpl 实例
  return new ComputedRefImpl(getter, setter) as any
}
```

- **参数处理**：`computed` 支持两种用法：
  - 传入一个 getter 函数（如上面的示例），此时计算属性是只读的。
  - 传入一个选项对象 `{ get, set }`，支持读写操作。
- **返回值**：返回一个 `ComputedRefImpl` 实例，它是一个特殊的 `Ref` 类型。

### 2. `ComputedRefImpl` 类

`ComputedRefImpl` 是 `computed` 的核心实现类，定义如下：

```typescript
class ComputedRefImpl<T> {
  private _value!: T // 计算结果的缓存值
  private _dirty = true // 脏检查标记
  public readonly effect: ReactiveEffect<T> // 响应式副作用

  constructor(getter: ComputedGetter<T>, private _setter: ComputedSetter<T>) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true // 依赖变化时标记为脏
        triggerRefValue(this) // 触发依赖更新
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._value = this.effect.run() // 重新计算
      this._dirty = false // 重置脏标记
    }
    trackRefValue(this) // 收集依赖
    return this._value
  }

  set value(newValue: T) {
    this._setter(newValue) // 调用 setter
  }
}
```

#### 关键点解析：

- **`_dirty` 脏检查**：用于实现计算属性的缓存机制。只有当依赖变化时，`_dirty` 会被置为 `true`，下次访问 `value` 时才会重新计算。
- **`effect`**：基于 `ReactiveEffect` 类（Vue 3 响应式系统的核心），负责执行 getter 函数并追踪依赖。
- **`get value()`**：当访问计算属性的 `value` 时：
  1. 如果 `_dirty` 为 `true`，运行 `effect.run()` 重新计算值，并缓存结果。
  2. 调用 `trackRefValue` 收集依赖，确保响应式更新。
- **`set value()`**：如果提供了 `setter`，可以修改计算属性；否则提示只读。

### 3. 依赖追踪与更新

`computed` 的响应式依赖于 Vue 的 `effect` 系统：

- 在 `getter` 函数执行时（如 `() => count.value * 2`），`count.value` 的访问会触发 `track` 操作，将当前 `effect` 注册为依赖。
- 当 `count.value` 改变时，`trigger` 操作会调用 `effect` 的调度函数（scheduler），将 `_dirty` 置为 `true`，从而触发下一次访问时的重新计算。

## 三、结合示例深入理解

### 示例 1：只读计算属性

```javascript
const count = ref(1)
const double = computed(() => count.value * 2)

console.log(double.value) // 2
count.value = 3
console.log(double.value) // 6
```

**源码流程**：

1. `computed` 创建 `ComputedRefImpl` 实例，`getter` 为 `() => count.value * 2`。
2. 第一次访问 `double.value`，`_dirty` 为 `true`，执行 `getter`，缓存结果 `2`。
3. 修改 `count.value`，触发 `effect` 的 scheduler，将 `_dirty` 置为 `true`。
4. 再次访问 `double.value`，重新计算得 `6`。

### 示例 2：可写计算属性

```javascript
const count = ref(1)
const double = computed({
  get: () => count.value * 2,
  set: val => (count.value = val / 2),
})

console.log(double.value) // 2
double.value = 10
console.log(count.value) // 5
console.log(double.value) // 10
```

**源码流程**：

1. `computed` 接收选项对象，初始化 `getter` 和 `setter`。
2. 访问 `double.value` 时，调用 `get`，返回 `2`。
3. 设置 `double.value = 10`，调用 `set`，更新 `count.value` 为 `5`。
4. 再次访问 `double.value`，因依赖变化，重新计算得 `10`。

## 四、性能优化与缓存

`computed` 的一个重要特性是缓存。通过 `_dirty` 标志，只有在依赖变化时才会重新计算，避免了不必要的性能开销。例如：

```javascript
const count = ref(1)
const double = computed(() => {
  console.log('Computing...')
  return count.value * 2
})

console.log(double.value) // "Computing..." 2
console.log(double.value) // 2（无日志，缓存生效）
count.value = 3
console.log(double.value) // "Computing..." 6
```

- 第一次访问触发计算。
- 第二次访问直接返回缓存值。
- 依赖变化后重新计算。

## 五、总结

Vue 3 的 `computed` 通过 `ComputedRefImpl` 和 `ReactiveEffect` 的结合，实现了高效的响应式计算属性。其核心机制包括：

- **依赖追踪**：通过 `effect` 系统自动收集和更新依赖。
- **缓存优化**：利用 `_dirty` 标志避免重复计算。
- **灵活性**：支持只读和读写两种模式。

无论是简单的数据衍生，还是复杂的业务逻辑，`computed` 都能提供优雅的解决方案。希望本文的源码解读和示例能帮助你更深入地理解这一强大工具！
