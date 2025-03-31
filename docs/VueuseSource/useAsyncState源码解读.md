---
top: 10
sticky: 1000
sidebar:
  title: useAsyncState源码解读
  isTimeLine: true
title: useAsyncState源码解读
date: 2025-03-30
tags:
  - 前端
  - javascript
  - 源码
  - VueUse
categories:
  - 前端
---

<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2025-03-30 22:27:19
 * @FilePath: \VitePress\docs\VueuseSource\useAsyncState源码解读.md
-->

# 解读 VueUse 中的 `useAsyncState` 方法：从源码到应用

`useAsyncState` 是一个用于处理异步状态的实用工具。它允许开发者以声明式的方式管理异步操作，同时保持响应式特性，非常适合需要从服务器获取数据或处理复杂异步逻辑的场景。今天，我们将通过分析其源码，深入理解 `useAsyncState` 的实现原理，并探讨如何在实际开发中使用它。

---

## `useAsyncState` 的基本用法

在深入源码之前，我们先来看看 `useAsyncState` 的基本用法。以下是一个简单的例子：

```javascript
import { useAsyncState } from '@vueuse/core'
import axios from 'axios'

const { state, isReady, isLoading, error, execute } = useAsyncState(
  () => axios.get('https://api.example.com/data').then(res => res.data),
  null, // 初始状态
  { immediate: true } // 立即执行
)
```

在这个例子中：

- `state` 是异步操作的结果（响应式）。
- `isReady` 表示异步操作是否完成。
- `isLoading` 表示当前是否正在加载。
- `error` 捕获异步操作中的错误。
- `execute` 是一个手动触发异步操作的方法。

通过这个简单的 API，我们可以轻松管理异步状态，而无需手动编写大量的样板代码。那么，这一切是如何实现的呢？让我们打开源码一探究竟。

---

## 源码剖析

`useAsyncState` 的源码位于 `vueuse/packages/core/useAsyncState/index.ts` 中。我们将逐步拆解其核心实现。

### 1. 函数签名与参数

```typescript
export function useAsyncState<Data, Params extends any[] = any[], Shallow extends boolean = true>(
  promise: Promise<Data> | ((...args: Params) => Promise<Data>),
  initialState: Data,
  options?: UseAsyncStateOptions<Shallow, Data>
): UseAsyncStateReturn<Data, Params, Shallow>
```

- **`promise`**：可以是一个 `Promise` 对象，或者一个返回 `Promise` 的函数。这提供了灵活性，允许传入静态的 Promise 或动态生成的异步操作。
- **`initialState`**：初始状态，在异步操作完成之前使用。
- **`options`**：配置对象，支持多种选项，例如 `immediate`（是否立即执行）、`delay`（延迟执行时间）、`onSuccess` 和 `onError`（成功和失败的回调）等。

返回值是一个包含 `state`、`isReady`、`isLoading`、`error` 和 `execute` 的对象。

### 2. 核心实现

以下是简化后的核心代码（去掉了一些类型定义和边缘情况处理）：

```typescript
import { shallowRef, ref } from 'vue'
import { promiseTimeout } from '@vueuse/shared'

export function useAsyncState<Data, Params extends any[] = any[], Shallow extends boolean = true>(
  promise: Promise<Data> | ((...args: Params) => Promise<Data>),
  initialState: Data,
  options?: UseAsyncStateOptions<Shallow, Data>
) {
  const {
    immediate = true,
    delay = 0,
    onError = () => {},
    onSuccess = () => {},
    resetOnExecute = true,
    shallow = true,
    throwError,
  } = options ?? {}

  // 初始化响应式状态
  const state = shallow ? shallowRef(initialState) : ref(initialState)
  const isReady = ref(false)
  const isLoading = ref(false)
  const error = ref<unknown | undefined>(undefined)

  // 执行异步操作的核心逻辑
  async function execute(delay = 0, ...args: any[]) {
    if (resetOnExecute) state.value = initialState
    error.value = undefined
    isReady.value = false
    isLoading.value = true

    if (delay > 0) await promiseTimeout(delay)

    const _promise = typeof promise === 'function' ? promise(...args) : promise

    try {
      const data = await _promise
      state.value = data
      isReady.value = true
      onSuccess(data)
    } catch (e) {
      error.value = e
      onError(e)
      if (throwError) throw e
    } finally {
      isLoading.value = false
    }

    return state.value as Data
  }

  // 如果 immediate 为 true，则立即执行
  if (immediate) {
    execute(delay)
  }

  return {
    state,
    isReady,
    isLoading,
    error,
    execute,
  }
}
```

#### 关键点分析

1. **响应式状态管理**：

   - 使用 `shallowRef` 或 `ref` 根据 `shallow` 选项来创建 `state`，决定是否对深层对象进行响应式追踪。
   - `isReady`、`isLoading` 和 `error` 都是通过 `ref` 创建的，确保这些状态的变化能触发视图更新。

2. **`execute` 函数**：

   - 这是异步操作的核心执行逻辑。
   - 如果 `resetOnExecute` 为 `true`，每次执行时会将 `state` 重置为 `initialState`。
   - 支持延迟执行（通过 `promiseTimeout`）。
   - 根据 `promise` 的类型（函数或静态 Promise），动态决定如何调用。
   - 使用 `try/catch` 处理错误，并通过 `onError` 和 `onSuccess` 提供回调支持。

3. **立即执行**：

   - 如果 `immediate` 为 `true`（默认值），则在函数初始化时立即调用 `execute`。

4. **灵活性与错误处理**：
   - `throwError` 选项允许在执行过程中抛出错误，便于开发者自定义错误处理逻辑。
   - `delay` 参数支持延迟执行，适用于需要节流或防抖的场景。

---

## 设计理念与优势

通过源码，我们可以看到 `useAsyncState` 的几个设计亮点：

1. **响应式与非阻塞**：

   - 它不会阻塞组件的 `setup` 函数，而是通过响应式状态在异步操作完成后触发更新。这与 Vue 的响应式系统无缝集成。

2. **简洁的 API**：

   - 通过返回一个对象，开发者可以直接解构出所需的状态和方法，减少样板代码。

3. **高度可配置**：

   - 提供了丰富的选项（`immediate`、`delay`、`resetOnExecute` 等），满足不同场景的需求。

4. **错误与加载状态管理**：
   - 内置了对加载状态和错误的追踪，省去了手动管理的麻烦。

---

## 实际应用场景

### 场景 1：获取远程数据

```javascript
import { useAsyncState } from '@vueuse/core'
import axios from 'axios'

export default {
  setup() {
    const { state, isLoading, error } = useAsyncState(
      () => axios.get('https://api.example.com/users').then(res => res.data),
      [],
      { immediate: true }
    )

    return { users: state, isLoading, error }
  },
}
```

在这个例子中，我们从服务器获取用户列表，并通过 `isLoading` 和 `error` 在模板中显示加载状态或错误信息。

### 场景 2：手动触发异步操作

```javascript
import { useAsyncState } from '@vueuse/core'
import axios from 'axios'

export default {
  setup() {
    const { state, execute, isLoading } = useAsyncState(
      id => axios.get(`https://api.example.com/user/${id}`).then(res => res.data),
      null,
      { immediate: false }
    )

    const fetchUser = id => execute(0, id)

    return { user: state, isLoading, fetchUser }
  },
}
```

在这里，我们将 `immediate` 设置为 `false`，并通过 `fetchUser` 方法手动触发请求，适用于需要用户交互触发的场景。

---

## 注意事项与优化建议

1. **避免立即执行的误区**：

   - 如果传入的是一个立即执行的 Promise（如 `axios.get().then()`），即使设置了 `immediate: false`，Promise 本身可能已经开始执行。正确的做法是将异步逻辑包裹在一个函数中，例如 `() => axios.get()`。

2. **性能优化**：

   - 在高频调用的场景中，可以结合 `delay` 或自定义防抖逻辑，避免重复请求。

3. **错误处理**：
   - 使用 `onError` 回调来记录日志或显示用户友好的提示，而不是仅仅依赖 `error` 的值。

---

## 总结

通过对 `useAsyncState` 源码的解读，我们可以看到它是一个精心设计的工具，将异步操作与 Vue 的响应式系统完美结合。它的实现不仅简洁高效，还提供了足够的灵活性，适用于各种实际开发场景。无论是快速获取数据，还是手动控制异步逻辑，`useAsyncState` 都能帮助开发者减少重复工作，提升代码质量。

如果你还没有在项目中尝试过 VueUse，不妨从 `useAsyncState` 开始，体验它带来的便利吧！
