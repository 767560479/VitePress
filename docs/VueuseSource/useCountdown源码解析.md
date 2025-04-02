---
top: 10
sticky: 1000
sidebar:
  title: useCountdown源码解析
  isTimeLine: true
title: useCountdown源码解析
date: 2025-04-02
tags:
  - 前端
  - javascript
  - 源码
  - VueUse
categories:
  - 前端
---

# 深入剖析 VueUse 的 `useCountdown`：源码解读与使用示例

在现代前端开发中，倒计时功能是一个常见的场景，比如限时抢购、验证码倒计时或游戏计时器等。VueUse 是一个专为 Vue 3 设计的实用工具库，其中 `useCountdown` 提供了一个简洁而强大的倒计时解决方案。本文将深入分析 `useCountdown` 的源码实现，并结合实际使用示例，帮助你更好地理解和应用这一工具。

---

## `useCountdown` 简介

`useCountdown` 是一个基于 Vue 3 组合式 API 的 Hook，用于创建和管理倒计时逻辑。它接受初始时间和配置选项，返回倒计时的状态和控制方法。以下是一个简单的使用示例：

```javascript
import { useCountdown } from '@vueuse/core'

const { remaining, isActive, start, pause, resume, stop } = useCountdown(60, { immediate: true })
```

在这个例子中，我们创建了一个从 60 秒开始的倒计时，并通过 `immediate: true` 配置使其自动启动。

---

## 源码解读

让我们逐步剖析 `useCountdown` 的源码实现（以下为简化版本，基于 VueUse v10.x 的逻辑，具体实现可参考官方仓库）：

```javascript
import { ref, computed, onUnmounted } from 'vue'
import { useIntervalFn } from '@vueuse/core'

export function useCountdown(count, options = {}) {
  // 默认配置
  const {
    immediate = false,
    interval = 1000, // 默认每秒更新
  } = options

  // 剩余时间
  const remaining = ref(count)
  // 是否激活状态
  const isActive = ref(false)
  // 开始时间戳
  const startTime = ref(null)

  // 计算剩余时间
  const updateRemaining = () => {
    if (!startTime.value) return
    const elapsed = Math.max(0, Date.now() - startTime.value)
    const newRemaining = Math.max(0, Math.round((count * 1000 - elapsed) / 1000))
    remaining.value = newRemaining
    if (newRemaining <= 0) {
      pause()
    }
  }

  // 使用 useIntervalFn 管理定时器
  const { pause, resume } = useIntervalFn(updateRemaining, interval, { immediate: false })

  // 开始倒计时
  const start = () => {
    if (isActive.value) return
    startTime.value = Date.now()
    isActive.value = true
    resume()
  }

  // 暂停倒计时
  const pauseFn = () => {
    if (!isActive.value) return
    pause()
    isActive.value = false
  }

  // 重置倒计时
  const reset = () => {
    pause()
    isActive.value = false
    remaining.value = count
    startTime.value = null
  }

  // 停止并重置为 0
  const stop = () => {
    pause()
    isActive.value = false
    remaining.value = 0
    startTime.value = null
  }

  // 是否已结束
  const isFinished = computed(() => remaining.value <= 0)

  // 组件卸载时清理
  onUnmounted(() => {
    pause()
  })

  // 如果配置为立即开始
  if (immediate) {
    start()
  }

  return {
    remaining,
    isActive,
    isFinished,
    start,
    pause: pauseFn,
    resume,
    reset,
    stop,
  }
}
```

### 源码关键点解析

1. **状态管理**：

   - `remaining`：剩余时间，使用 `ref` 存储，单位为秒。
   - `isActive`：倒计时是否正在运行。
   - `startTime`：记录倒计时开始的时间戳，用于计算经过的时间。

2. **时间计算**：

   - `updateRemaining` 函数通过当前时间与 `startTime` 的差值，动态计算剩余时间，并确保不会出现负值。
   - 当剩余时间为 0 时，自动暂停倒计时。

3. **定时器管理**：

   - 使用 VueUse 的 `useIntervalFn` 替代原生的 `setInterval`，提供更灵活的控制（如暂停和恢复）。
   - 默认每 1000 毫秒（1 秒）更新一次。

4. **控制方法**：

   - `start`：启动倒计时，记录开始时间并激活定时器。
   - `pause`：暂停倒计时，停止定时器。
   - `resume`：恢复倒计时，继续定时器。
   - `reset`：重置到初始值。
   - `stop`：停止并将剩余时间设为 0。

5. **生命周期管理**：
   - 通过 `onUnmounted` 确保组件销毁时清理定时器，避免内存泄漏。

---

## 使用示例

下面是一个实际的 Vue 组件示例，展示如何使用 `useCountdown` 实现一个验证码倒计时功能：

```vue
<template>
  <div>
    <p>剩余时间：{{ remaining }} 秒</p>
    <button :disabled="isActive || remaining > 0" @click="startCountdown">
      {{ isActive ? '倒计时中...' : '获取验证码' }}
    </button>
    <button @click="resetCountdown">重置</button>
  </div>
</template>

<script setup>
  import { useCountdown } from '@vueuse/core'

  const { remaining, isActive, start, reset } = useCountdown(60, { immediate: false })

  const startCountdown = () => {
    start()
    // 模拟发送验证码请求
    console.log('验证码已发送')
  }

  const resetCountdown = () => {
    reset()
    console.log('倒计时已重置')
  }
</script>

<style scoped>
  button {
    margin: 0 10px;
    padding: 5px 10px;
  }
</style>
```

### 示例说明

1. **功能**：

   - 点击“获取验证码”按钮启动 60 秒倒计时。
   - 倒计时进行中，按钮被禁用并显示“倒计时中...”。
   - 点击“重置”按钮将倒计时恢复到初始状态。

2. **效果**：
   - 用户点击“获取验证码”后，`remaining` 从 60 开始递减，每秒更新一次。
   - 倒计时结束后，按钮恢复可用状态。

---

## 扩展与优化

1. **自定义间隔**：
   如果需要更精确的倒计时，可以调整 `interval` 参数。例如，每 100 毫秒更新一次：

   ```javascript
   const { remaining } = useCountdown(10, { interval: 100 })
   ```

2. **格式化输出**：
   可以结合计算属性格式化剩余时间：

   ```javascript
   const formattedTime = computed(() => {
     const minutes = Math.floor(remaining.value / 60)
     const seconds = remaining.value % 60
     return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
   })
   ```

3. **事件监听**：
   如果需要在倒计时结束时触发事件，可以监听 `isFinished`：
   ```javascript
   watch(isFinished, finished => {
     if (finished) {
       console.log('倒计时结束！')
     }
   })
   ```

---

## 总结

通过对 `useCountdown` 的源码分析，我们可以看到它巧妙地结合了 Vue 的响应式系统和定时器管理，提供了简单易用的倒计时功能。无论是简单的倒计时展示，还是复杂的业务逻辑，`useCountdown` 都能轻松胜任。
