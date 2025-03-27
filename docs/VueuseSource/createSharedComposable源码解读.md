---
top: 100
sticky: 1000
sidebar:
  title: createSharedComposable 源码解读
  isTimeLine: true
title: createSharedComposable 源码解读
date: 2025-03-27
tags:
  - 前端
  - javascript
  - 源码
categories:
  - 前端
---

<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2025-03-27 23:49:34
 * @FilePath: \VitePress\docs\SourceCodeAnalysis\vueuse\createSharedComposable 源码解读.md
-->

# VueUse`createSharedComposable`源码解读

在 Vue 的开发中，组合式函数（Composables）是实现逻辑复用的核心工具。然而，有时我们需要在多个组件或实例之间共享同一个组合式函数的状态和副作用，而不希望每次调用都创建新的实例。VueUse 提供的 `createSharedComposable` 正是为此设计的工具。本文将深入剖析其源码，探索它的实现细节和应用价值。

## 一、功能概述

`createSharedComposable` 是一个高阶函数，它将普通的组合式函数转化为一个“共享”的组合式函数。它的核心特性是：

- 在多个调用者之间共享同一份状态和副作用。
- 自动管理副作用的作用域（Effect Scope），并在不再需要时清理资源。

### 使用示例

```javascript
import { createSharedComposable } from '@vueuse/core'
import { ref } from 'vue'

// 定义一个普通的组合式函数
function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}

// 创建共享版本
const useSharedCounter = createSharedComposable(useCounter)

// 在多个组件中使用
const { count, increment } = useSharedCounter()
```

无论在多少个组件中调用 `useSharedCounter`，它们共享同一个 `count` 实例。

## 二、源码结构与参数

### 函数签名

```typescript
export function createSharedComposable<Fn extends AnyFn>(composable: Fn): Fn
```

- `composable`: 一个普通的组合式函数，类型为 `AnyFn`（任意函数）。
- 返回值: 一个新的函数，类型与 `composable` 一致，但具有共享特性。

## 三、核心实现解析

### 1. 状态管理

```typescript
let subscribers = 0
let state: ReturnType<Fn> | undefined
let scope: EffectScope | undefined
```

- `subscribers`: 记录当前使用该共享组合式函数的订阅者数量。
- `state`: 存储 `composable` 的返回值，即共享的状态。
- `scope`: 一个 `EffectScope` 实例，用于管理副作用的作用域。

这些变量定义在函数闭包中，确保在多次调用共享函数时保持单一实例。

### 2. 清理逻辑 `dispose`

```typescript
const dispose = () => {
  subscribers -= 1
  if (scope && subscribers <= 0) {
    scope.stop()
    state = undefined
    scope = undefined
  }
}
```

- 每次调用者取消订阅时，`subscribers` 减 1。
- 当订阅者数量降至 0 时：
  - 调用 `scope.stop()` 停止副作用作用域。
  - 清空 `state` 和 `scope`，释放资源。

### 3. 主逻辑

```typescript
return <Fn>((...args) => {
  subscribers += 1
  if (!scope) {
    scope = effectScope(true)
    state = scope.run(() => composable(...args))
  }
  tryOnScopeDispose(dispose)
  return state
})
```

- **订阅计数**: 每次调用时，`subscribers` 加 1。
- **初始化**: 如果 `scope` 不存在（即首次调用）：
  - 创建一个新的 `EffectScope`（通过 `effectScope(true)`，表示独立作用域）。
  - 在该作用域内运行 `composable`，将其返回值赋值给 `state`。
- **自动清理**: 使用 `tryOnScopeDispose` 在当前作用域销毁时调用 `dispose`，确保资源管理。
- **返回值**: 返回共享的 `state`，而不是每次重新计算。

## 四、工作原理

### 闭包与单例

`createSharedComposable` 利用闭包特性，将 `subscribers`、`state` 和 `scope` 保存在函数外部作用域中。这意味着无论调用多少次返回的函数，它们共享同一份数据和副作用。

### EffectScope 的作用

Vue 3 提供了 `effectScope` API，用于管理一组副作用（如 `ref`、`computed` 或 `watch`）的生命周期。`createSharedComposable` 使用它来：

- 确保 `composable` 中的响应式副作用（如 `watch`）被绑定到一个独立的作用域。
- 在所有订阅者取消时，通过 `scope.stop()` 一次性清理所有副作用。

### 资源管理

通过 `tryOnScopeDispose`，`dispose` 被绑定到调用者的生命周期。当组件销毁时，自动减少订阅计数，并在必要时清理资源。

## 五、使用场景与优势

### 场景

1. **全局状态管理**  
   在不需要复杂状态管理库（如 Pinia 或 Vuex）时，共享简单的全局状态。

   ```javascript
   const useSharedModal = createSharedComposable(() => {
     const isOpen = ref(false)
     const toggle = () => (isOpen.value = !isOpen.value)
     return { isOpen, toggle }
   })
   ```

2. **跨组件事件监听**  
   共享一个事件监听器，避免重复绑定。
   ```javascript
   const useSharedClick = createSharedComposable(() => {
     const clicks = ref(0)
     window.addEventListener('click', () => clicks.value++)
     return { clicks }
   })
   ```

### 优势

- **性能优化**: 避免重复创建状态和副作用。
- **简洁性**: 无需引入额外的状态管理库。
- **生命周期管理**: 自动清理资源，防止内存泄漏。

## 六、注意事项

1. **作用域依赖**  
   如果 `composable` 内部依赖外部的响应式数据，确保这些数据是全局可访问的，否则可能导致意外行为。

2. **线程安全**  
   该实现不考虑并发问题，在大多数单线程 JavaScript 环境中是安全的，但在特殊场景下（如 SSR）需谨慎使用。

3. **调试复杂性**  
   由于状态是共享的，调试时可能需要额外注意状态来源。

## 七、总结

`createSharedComposable` 是 VueUse 中一个优雅的工具，它通过闭包和 `EffectScope` 实现了组合式函数的共享与生命周期管理。它的设计既简单又强大，特别适合需要轻量级全局状态管理的场景。通过这篇源码解读，希望你能更深入理解它的原理，并在项目中灵活运用！
