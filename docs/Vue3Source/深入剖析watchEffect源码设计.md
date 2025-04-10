---
top: 1
sticky: 1000
sidebar:
  title: 深入剖析watchEffect源码设计
  isTimeLine: true
title: 深入剖析watchEffect源码设计
date: 2025-04-11
tags:
  - 前端
  - javascript
  - 源码
  - Vue3
categories:
  - 前端
---

# 深入剖析watchEffect源码设计

在 Vue3 的响应式系统中，`watchEffect`是一个能够自动追踪依赖并执行副作用的神奇函数。本文将带您深入源码，解析其背后的实现机制。

---

## 一、源码定位与入口

在`@vue/runtime-core`模块的`src/apiWatch.ts`中，`watchEffect`的实现仅有寥寥数行：

```typescript
// 简化后代码
export function watchEffect(
  effect: (onCleanup: OnCleanup) => void,
  options?: WatchEffectOptions
): WatchStopHandle {
  return doWatch(effect, null, options)
}
```

其核心逻辑委托给`doWatch`函数，该函数同时服务于`watch`和`watchEffect`。

---

## 二、核心逻辑：doWatch 函数解析

### 1. 参数处理与 Getter 生成

```typescript
function doWatch(
  source: WatchSource | WatchSource[],
  cb: WatchCallback | null,
  { immediate, flush, onTrack, onTrigger }: WatchOptions = EMPTY_OBJ
): WatchStopHandle {
  // 生成getter函数
  const getter = () => {
    if (cleanup) cleanup()
    // 执行effect函数，收集依赖
    effect.onTrack = onTrack
    effect.onTrigger = onTrigger
    return source()
  }
}
```

对于`watchEffect`，`source`是用户传入的副作用函数。每次执行`getter`时，都会调用该函数并触发响应式依赖收集。

### 2. 副作用实例创建

```typescript
const effect = new ReactiveEffect(getter, scheduler)
effect.run() // 立即执行首次依赖收集
```

`ReactiveEffect`是 Vue 响应系统的核心类，负责管理副作用执行和依赖追踪：

- **首次运行**：立即执行`getter`，触发响应式属性的`get`操作，建立依赖关系
- **依赖更新**：通过 Proxy 的`track`和`trigger`机制追踪变化

### 3. 调度器（Scheduler）机制

```typescript
let scheduler: EffectScheduler
scheduler = () => {
  if (!effect.active) return
  if (cb) {
    /* watch逻辑 */
  } else {
    // watchEffect分支
    effect.run() // 直接重新运行副作用
  }
}
```

当依赖变化时，调度器决定如何执行副作用。`watchEffect`直接重新运行原始函数，而`watch`会根据配置决定执行时机。

---

## 三、关键特性实现原理

### 1. 自动依赖追踪

通过`ReactiveEffect`的`run`方法：

```typescript
class ReactiveEffect {
  run() {
    activeEffect = this // 设置为当前激活的effect
    try {
      return this.fn() // 执行副作用函数
    } finally {
      activeEffect = undefined
    }
  }
}
```

利用全局变量`activeEffect`，在响应式属性`get`操作时通过`track`函数建立依赖关系。

### 2. 清理机制（onCleanup）

```typescript
let cleanup: () => void
const onCleanup: OnCleanup = (fn: () => void) => {
  cleanup = effect.onStop = () => fn()
}
```

每次副作用执行前会先执行前一次的清理函数，避免异步操作导致的竞态问题。

### 3. 停止监听

```typescript
const stop = () => {
  if (effect.active) {
    effect.stop()
    // 执行清理函数
    if (cleanup) cleanup()
  }
}
return stop
```

调用返回的停止函数后，将标记 effect 为未激活状态，后续依赖变化不再触发。

---

## 四、执行时机控制（flush 选项）

通过调度器配合任务队列实现不同的执行时机：

```typescript
if (flush === 'sync') {
  scheduler = job
} else if (flush === 'post') {
  scheduler = () => queuePostRenderEffect(job)
} else {
  scheduler = () => queuePreFlushCb(job)
}
```

- **pre**：组件更新前执行
- **post**：组件更新后执行（默认）
- **sync**：同步立即执行

---

## 五、设计亮点

1. **模块化设计**：通过`doWatch`统一处理`watch`和`watchEffect`的核心逻辑
2. **懒依赖收集**：仅在副作用执行时收集实际使用的依赖
3. **清理链式管理**：通过闭包保存清理函数，确保异步操作的安全性
4. **高效调度**：利用队列批处理避免重复执行

---

## 六、使用建议

```javascript
// 典型用法
const stop = watchEffect(onCleanup => {
  const data = fetch(url.value)
  onCleanup(() => data.cancel())
})

// 组件卸载时自动清理
onUnmounted(stop)
```

---

通过剖析源码可见，`watchEffect`的精妙之处在于将响应式追踪与副作用管理完美结合。这种设计既保证了开发便利性，又通过底层优化确保了运行效率，充分体现了 Vue3 响应式系统的精妙设计。
