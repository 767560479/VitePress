---
top: 2
sticky: 1000
sidebar:
  title: watch源码方法解读与使用示例
  isTimeLine: true
title: watch源码方法解读与使用示例
date: 2025-04-06
tags:
  - 前端
  - javascript
  - 源码
  - Vue3
categories:
  - 前端
---

# Vue 3 `watch` 源码方法解读与使用示例

在 Vue 3 中，`watch` 是一个非常强大的响应式工具，用于监听数据的变化并执行副作用逻辑。相比于 Vue 2，Vue 3 的 `watch` 提供了更灵活的 API，并且与 Composition API 无缝集成。本文将深入剖析 `watch` 的源码实现原理，并通过实际示例展示其用法。

## 一、`watch` 的基本用法

在开始分析源码之前，我们先来看看 `watch` 的基本用法。Vue 3 提供了 `watch` 函数，可以在 `setup` 或组合式 API 中使用。

### 示例 1：监听单个响应式数据

```javascript
import { ref, watch } from 'vue'

export default {
  setup() {
    const count = ref(0)

    watch(count, (newValue, oldValue) => {
      console.log(`count 从 ${oldValue} 变为 ${newValue}`)
    })

    const increment = () => {
      count.value++
    }

    return { count, increment }
  },
}
```

在这个例子中，我们监听了 `count` 的变化，每次 `count` 更新时，回调函数都会被触发，输出新旧值。

### 示例 2：监听复杂对象

```javascript
import { reactive, watch } from 'vue'

export default {
  setup() {
    const state = reactive({
      name: 'Alice',
      age: 25,
    })

    watch(
      () => state.age,
      (newAge, oldAge) => {
        console.log(`age 从 ${oldAge} 变为 ${newAge}`)
      }
    )

    const updateAge = () => {
      state.age++
    }

    return { state, updateAge }
  },
}
```

这里我们通过返回一个 getter 函数 `() => state.age` 来监听 `state` 对象中的 `age` 属性。

## 二、`watch` 源码解读

Vue 3 的 `watch` 实现位于 `packages/reactivity/src/effect.ts` 和 `packages/runtime-core/src/apiWatch.ts` 中。接下来我们逐步分析其核心逻辑。

### 1. `watch` 函数的入口

在 Vue 3 中，`watch` 是一个导出函数，它的定义大致如下（简化版）：

```javascript
export function watch(source, cb, options) {
  return doWatch(source, cb, options)
}
```

`watch` 函数接收三个参数：

- `source`：要监听的目标，可以是 `ref`、`reactive` 对象或一个 getter 函数。
- `cb`：变化时的回调函数。
- `options`：可选配置，例如 `{ immediate: true, deep: true }`。

真正的实现逻辑在 `doWatch` 函数中。

### 2. `doWatch` 的核心逻辑

`doWatch` 是 `watch` 的内部实现，负责创建和调度副作用。以下是简化的代码片段：

```javascript
function doWatch(source, cb, { immediate, deep } = {}) {
  let getter
  let isMultiSource = false

  // 处理不同的 source 类型
  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
    deep = true // reactive 对象默认深度监听
  } else if (isFunction(source)) {
    getter = source
  } else {
    warn('watch 的 source 必须是 ref, reactive 或函数')
    return
  }

  // 如果需要深度监听，包装 getter
  if (deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let oldValue
  const job = () => {
    const newValue = effect.run()
    if (cb) {
      cb(newValue, oldValue)
      oldValue = newValue
    }
  }

  // 创建 effect
  const effect = new ReactiveEffect(getter, job)

  // 是否立即执行
  if (immediate) {
    job()
  } else {
    oldValue = effect.run()
  }

  return () => {
    effect.stop()
  }
}
```

#### 关键点解析：

- **source 的类型处理**：`watch` 支持多种类型的 `source`，包括 `ref`、`reactive` 和 getter 函数。`getter` 是统一用来获取值的函数。
- **深度监听（deep）**：如果设置了 `deep: true`，会调用 `traverse` 函数递归遍历对象的所有属性，确保深层变化也能触发。
- **副作用（effect）**：`watch` 利用了 Vue 的响应式系统中的 `ReactiveEffect` 类。每次 `getter` 依赖的数据变化时，`job` 会被调度执行。
- **immediate 选项**：如果设置为 `true`，`watch` 会立即执行一次回调。

### 3. 依赖收集与触发

Vue 3 的响应式核心基于 `Proxy`，当 `getter` 执行时，会触发 `Proxy` 的 `get` 操作，从而被 `ReactiveEffect` 收集依赖。当数据变化时（触发 `set`），依赖会被通知，执行 `job`，最终调用用户的回调函数。

## 三、进阶使用示例

### 示例 3：带选项的深度监听

```javascript
import { reactive, watch } from 'vue'

export default {
  setup() {
    const user = reactive({
      info: {
        name: 'Bob',
        address: {
          city: 'New York',
        },
      },
    })

    watch(
      () => user.info,
      (newInfo, oldInfo) => {
        console.log('info 更新了', newInfo, oldInfo)
      },
      { deep: true }
    )

    const updateCity = () => {
      user.info.address.city = 'London'
    }

    return { user, updateCity }
  },
}
```

在这个例子中，`deep: true` 确保即使是嵌套对象 `address.city` 的变化也能被监听到。

### 示例 4：停止监听

```javascript
import { ref, watch } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const stop = watch(count, newValue => {
      console.log('count 变化:', newValue)
    })

    const increment = () => {
      count.value++
      if (count.value === 3) {
        stop() // 停止监听
        console.log('监听已停止')
      }
    }

    return { count, increment }
  },
}
```

`watch` 返回一个停止函数，调用它可以手动停止监听。

## 四、总结

通过源码分析，我们可以看到 Vue 3 的 `watch` 是一个基于响应式系统的强大工具：

- 它通过 `getter` 统一了不同类型数据的监听方式。
- 借助 `ReactiveEffect`，实现了高效的依赖收集和副作用调度。
- 支持灵活的配置（如 `deep` 和 `immediate`），满足各种场景需求。

在实际开发中，`watch` 可以用来处理表单同步、数据懒加载、状态调试等场景。希望这篇文章能帮助你更深入理解 `watch` 的实现原理，并灵活运用到项目中！
