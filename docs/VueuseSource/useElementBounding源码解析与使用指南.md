---
top: 10
sticky: 1000
sidebar:
  title: useElementBounding源码解析与使用指南
  isTimeLine: true
title: useElementBounding源码解析与使用指南
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
 * @Date: 2025-03-31 23:08:42
 * @FilePath: \VitePress\docs\VueuseSource\useElementBounding源码解析与使用指南.md
-->

---

## VueUse useElementBounding 源码解析与使用指南

### 一、源码结构解析

#### 1. 核心函数定义

`useElementBounding` 接受两个参数：

- **target**：通过 `MaybeComputedElementRef` 类型支持响应式元素引用（如 `ref` 或 `computed` 返回值）
- **options**：配置对象，包含重置策略、窗口事件监听等（后文详述）

返回一个包含 8 个响应式属性和 `update` 方法的对象：

```typescript
{
  x: ShallowRef<number>,   // 元素左边界相对视口的 X 坐标
  y: ShallowRef<number>,   // 元素上边界相对视口的 Y 坐标
  top: ShallowRef<number>, // 元素上边界到文档顶部的距离
  // ...其他边界属性（width/height/left/right/bottom）
  update: () => void       // 手动触发边界计算
}
```

#### 2. 实现核心逻辑

源码核心流程如下：

1. **初始化状态**：通过 `window.getBoundingClientRect()` 获取初始边界值
2. **元素监听**：
   - 使用 `watch` 监听 `target` 变化，自动重新绑定监听器
   - 通过 `useResizeObserver` 监听元素尺寸变化触发更新
3. **窗口事件**：
   - 根据 `windowResize` 和 `windowScroll` 配置，动态绑定 `resize` 和 `scroll` 事件
4. **性能优化**：
   - 通过 `requestAnimationFrame` 控制更新频率
   - 支持 `updateTiming: 'next-frame'` 延迟更新，避免与布局抖动冲突

---

### 二、关键实现细节

#### 1. 响应式更新机制

```typescript
const update = () => {
  const el = unref(target)
  if (!el) return

  const rect = el.getBoundingClientRect()
  x.value = rect.x
  y.value = rect.y
  // ...其他属性更新
}
```

每次更新触发 `getBoundingClientRect()`，但通过 `ShallowRef` 优化引用类型性能

#### 2. 生命周期管理

- **卸载重置**：当 `options.reset=true` 时，组件卸载后所有属性归零
- **事件解绑**：自动清理 `resize`/`scroll` 监听器，避免内存泄漏

#### 3. 配置项详解

| 选项           | 默认值 | 说明                                          |
| -------------- | ------ | --------------------------------------------- |
| `reset`        | true   | 组件卸载时重置边界值为 0                      |
| `windowResize` | true   | 监听窗口 resize 事件                          |
| `windowScroll` | true   | 监听窗口 scroll 事件                          |
| `immediate`    | true   | 初始化立即计算边界                            |
| `updateTiming` | 'sync' | 更新时机（'sync' 立即 / 'next-frame' 下一帧） |

---

### 三、使用示例

#### 1. 基础用法

```vue
<template>
  <div ref="targetEl">可拖拽元素</div>
  <p>宽度：{{ width }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import { useElementBounding } from '@vueuse/core'

  const targetEl = ref(null)
  const { width, height, update } = useElementBounding(targetEl, {
    windowScroll: false, // 禁用滚动监听
  })
</script>
```

#### 2. 组件式用法

```vue
<UseElementBounding v-slot="{ x, y }">
  当前位置：{{ x }}, {{ y }}
</UseElementBounding>
```

#### 3. 指令式用法

```vue
<template>
  <div v-element-bounding="handleBoundingUpdate"></div>
</template>

<script setup>
  function handleBoundingUpdate({ width, height }) {
    console.log('新尺寸:', width, height)
  }
</script>
```

---

### 四、最佳实践与注意事项

1. **性能敏感场景**建议关闭 `windowScroll`，改用 `IntersectionObserver`
2. **动态元素**需配合 `watch` 监听元素引用变化：

```javascript
watch(targetEl, newEl => {
  if (newEl) update()
})
```

3. **SSR 兼容**：通过 `import { maybeElementRef } from '@vueuse/core'` 处理服务端渲染
4. **TypeScript 支持**：完整类型声明见 `@vueuse/core` 的类型定义文件

---

### 总结

`useElementBounding` 通过智能的事件绑定和响应式更新机制，将原生 `getBoundingClientRect` 转化为易用的 Composition API。其源码实现体现了 VueUse 对性能优化和开发体验的深度思考，是学习 Vue 响应式设计与浏览器 API 集成的优秀范例。
