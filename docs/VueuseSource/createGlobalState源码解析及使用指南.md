---
top: 10
sticky: 1000
sidebar:
  title: createGlobalState 源码解析及使用指南
  isTimeLine: true
title: createGlobalState 源码解析及使用指南
date: 2025-03-31
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
 * @Date: 2025-03-31 22:38:11
 * @FilePath: \VitePress\docs\VueuseSource\createGlobalState 源码解析及使用指南.md
-->

# VueUse createGlobalState 源码解析及使用指南

## 一、什么是 createGlobalState？

`createGlobalState` 是 VueUse 中用于创建全局响应式状态的工具函数，它解决了 Vue 3 组合式 API 在跨组件状态共享时的上下文隔离问题。该函数允许我们在多个组件实例中共享同一个响应式状态，同时保持对 SSR 的友好支持。

## 二、源码核心解析（基于 vueuse v9.0.0）

### 1. 函数签名

```typescript
export function createGlobalState<T>(stateFactory: () => T): () => T
```

### 2. 核心实现逻辑

```typescript
import { getCurrentInstance, effectScope } from 'vue'

export function createGlobalState<T>(stateFactory: () => T) {
  let state: T
  const scope = effectScope(true)

  return () => {
    // 服务端渲染处理
    if (__SSR__ && getCurrentInstance()) {
      const ssrContext = useSSRContext()
      if (!ssrContext.__vueuse_global_states__) ssrContext.__vueuse_global_states__ = {}
      if (!(ssrContext.__vueuse_global_states__ as any)[stateId])
        (ssrContext.__vueuse_global_states__ as any)[stateId] = stateFactory()
      return (ssrContext.__vueuse_global_states__ as any)[stateId]
    }

    // 客户端逻辑
    if (!state) {
      state = scope.run(stateFactory)!
    }

    return state
  }
}
```

### 3. 关键技术点

1. **单例模式实现**

- 通过闭包变量 `state` 保存状态实例
- 使用 effectScope 管理响应式依赖
- 首次调用时通过 `scope.run()` 初始化状态

2. **SSR 支持**

- 使用 `__SSR__` 常量判断运行环境
- 通过 `useSSRContext()` 获取 SSR 上下文
- 将状态挂载到请求级别的上下文对象

3. **生命周期管理**

- 自动绑定到当前组件实例
- 组件卸载时自动停止 effectScope
- 避免内存泄漏

## 三、使用示例

### 基础计数器示例

```typescript
// stores/useCounter.ts
import { createGlobalState, useStorage } from '@vueuse/core'

export const useCounter = createGlobalState(() => {
  const count = useStorage('global-counter', 0)
  const increment = () => count.value++
  return { count, increment }
})

// ComponentA.vue
<script setup>
const { count, increment } = useCounter()
</script>

// ComponentB.vue
<script setup>
const { count } = useCounter() // 共享同一状态
</script>
```

### 带自动清理的复杂状态

```typescript
const useGlobalTimer = createGlobalState(() => {
  const interval = ref<NodeJS.Timeout>()
  const seconds = ref(0)

  const start = () => {
    interval.value = setInterval(() => seconds.value++, 1000)
  }

  const stop = () => {
    clearInterval(interval.value)
    interval.value = undefined
  }

  onScopeDispose(stop) // 自动清理定时器

  return { seconds, start, stop }
})
```

## 四、注意事项

1. **状态初始化时机**

- 状态在首次调用时初始化
- 避免在服务端渲染时产生副作用

2. **类型安全**

- 推荐使用 TypeScript 类型标注
- 通过工厂函数确保类型一致性

3. **内存管理**

- 复杂状态需手动清理资源
- 使用 `onScopeDispose` 注册清理回调

4. **SSR 兼容**

- 状态键需保证唯一性
- 避免在服务端存储敏感数据

## 五、实现原理图解

```
[Component A] --> 调用工厂函数 --> [Global State]
       ↑                         ↗
       |                       /
[Component B] --------------→
```

## 六、与 Pinia 的对比

| 特性         | createGlobalState | Pinia        |
| ------------ | ----------------- | ------------ |
| 学习成本     | 低                | 中           |
| 类型支持     | 基础              | 完善         |
| SSR 支持     | 内置              | 需要配置     |
| 开发工具支持 | 无                | Vue DevTools |
| 适合场景     | 简单全局状态      | 复杂应用状态 |

## 七、总结

`createGlobalState` 通过巧妙的闭包和 effectScope 使用，提供了轻量级的全局状态管理方案。它特别适合以下场景：

- 需要快速共享简单状态的组件
- 无需持久化状态的临时共享数据
- 需要兼容 SSR 的全局状态管理
- 不想引入额外状态管理库的小型项目

对于复杂应用场景，建议结合 Pinia 等专业状态管理库使用。理解其实现原理有助于我们更好地使用和调试全局状态相关的功能。
