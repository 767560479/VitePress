---
top: 100
sticky: 1000
sidebar:
  title: onClickOutside 源码解读
  isTimeLine: true
title: onClickOutside 源码解读
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
 * @Date: 2025-03-27 23:40:51
 * @FilePath: \VitePress\docs\SourceCodeAnalysis\vueuse\onClickOutside 源码解读.md
-->

# VueUse`onClickOutside`源码解读

在前端开发中，我们经常需要检测用户是否点击了某个元素外部的区域，例如关闭下拉菜单、模态框等场景。VueUse 提供了一个强大且易用的工具函数 `onClickOutside`，用于监听元素外的点击事件。本文将深入剖析其源码，带你理解它的实现原理和关键细节。

## 一、功能概述

`onClickOutside` 是一个工具函数，用于监听目标元素外部的点击事件。当用户点击指定元素外部时，会触发开发者传入的回调函数。它支持多种配置选项，例如忽略某些元素、是否检测 iframe 的焦点切换等。

### 使用示例

```javascript
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'

const modal = ref(null)
onClickOutside(modal, () => {
  console.log('Clicked outside the modal!')
})
```

## 二、源码结构与参数

让我们从函数签名开始，逐步拆解其实现。

### 函数签名

```typescript
export function onClickOutside<T extends OnClickOutsideOptions>(
  target: MaybeElementRef,
  handler: OnClickOutsideHandler<{ detectIframe: T['detectIframe'] }>,
  options: T = {} as T
)
```

- `target`: 类型为 `MaybeElementRef`，表示监听的目标元素，可以是 DOM 元素、Vue 的 ref 或其他可解析为 DOM 的引用。
- `handler`: 点击外部时触发的回调函数，类型根据 `detectIframe` 选项动态变化（支持 `PointerEvent` 或 `FocusEvent`）。
- `options`: 配置对象，包含以下属性：
  - `window`: 指定事件监听的窗口对象，默认值为 `defaultWindow`。
  - `ignore`: 忽略的元素列表，点击这些元素不会触发 `handler`。
  - `capture`: 是否在捕获阶段监听事件，默认值为 `true`。
  - `detectIframe`: 是否检测 iframe 的焦点切换，默认值为 `false`。

返回值是一个 `stop` 函数，用于清理事件监听。

## 三、核心实现解析

### 1. 环境检测与初始化

```typescript
const { window = defaultWindow, ignore = [], capture = true, detectIframe = false } = options

if (!window) return noop
```

- 如果没有提供有效的 `window` 对象（例如在非浏览器环境运行），返回一个空函数 `noop`，避免后续逻辑执行。
- 解构并设置默认选项值。

### 2. iOS 兼容性修复

```typescript
if (isIOS && !_iOSWorkaround) {
  _iOSWorkaround = true
  Array.from(window.document.body.children).forEach(el => el.addEventListener('click', noop))
  window.document.documentElement.addEventListener('click', noop)
}
```

- 在 iOS 设备上，由于触摸事件的特殊性，可能导致点击事件无法正确触发。
- 通过在 `body` 的子元素和 `documentElement` 上绑定空的点击事件监听器，激活 iOS 的点击事件分发机制。这是基于 [StackOverflow 的解决方案](https://stackoverflow.com/a/39712411) 的修复。

### 3. 忽略逻辑 `shouldIgnore`

```typescript
const shouldIgnore = (event: PointerEvent) => {
  return ignore.some(target => {
    if (typeof target === 'string') {
      return Array.from(window.document.querySelectorAll(target)).some(
        el => el === event.target || event.composedPath().includes(el)
      )
    } else {
      const el = unrefElement(target)
      return el && (event.target === el || event.composedPath().includes(el))
    }
  })
}
```

- `ignore` 数组中的元素可以是 CSS 选择器字符串或元素引用。
- 对于字符串，通过 `querySelectorAll` 获取匹配的元素集合，检查点击目标是否在其中。
- 对于元素引用，使用 `unrefElement` 解析为 DOM 元素，检查点击目标是否为该元素或其子元素（通过 `composedPath` 判断事件路径）。

### 4. 主监听逻辑 `listener`

```typescript
const listener = (event: PointerEvent) => {
  const el = unrefElement(target)

  if (!el || el === event.target || event.composedPath().includes(el)) return

  if (event.detail === 0) shouldListen = !shouldIgnore(event)

  if (!shouldListen) {
    shouldListen = true
    return
  }

  handler(event)
}
```

- 获取目标元素 `el`，如果无效或点击发生在目标元素内部，则直接返回。
- `event.detail === 0` 表示事件可能是由触摸或其他非鼠标点击触发，此时检查是否需要忽略。
- `shouldListen` 是一个标志位，用于控制是否执行 `handler`。如果点击被忽略，则重置状态并跳过回调。

### 5. 事件监听与清理

```typescript
const cleanup = [
  useEventListener(window, 'click', listener, { passive: true, capture }),
  useEventListener(
    window,
    'pointerdown',
    e => {
      const el = unrefElement(target)
      shouldListen = !shouldIgnore(e) && !!(el && !e.composedPath().includes(el))
    },
    { passive: true }
  ),
  detectIframe &&
    useEventListener(window, 'blur', event => {
      setTimeout(() => {
        const el = unrefElement(target)
        if (
          window.document.activeElement?.tagName === 'IFRAME' &&
          !el?.contains(window.document.activeElement)
        )
          handler(event as any)
      }, 0)
    }),
].filter(Boolean) as Fn[]
```

- 使用 `useEventListener`（VueUse 提供的工具）绑定三种事件：
  1. `'click'`: 主点击事件，调用 `listener`。
  2. `'pointerdown'`: 在点击前检查是否需要监听，避免误触发。
  3. `'blur'`（可选）: 当 `detectIframe` 为 `true` 时，检测焦点移到 iframe，确保外部点击逻辑生效。
- `cleanup` 数组收集所有监听器的清理函数，`stop` 函数用于统一清理：

```typescript
const stop = () => cleanup.forEach(fn => fn())
```

## 四、关键特性与优化

1. **事件捕获阶段**  
   默认使用捕获阶段 (`capture: true`)，确保在事件冒泡前捕获点击，适合复杂嵌套结构的场景。

2. **触摸设备支持**  
   通过 `pointerdown` 和 iOS 修复，兼容触摸设备，避免点击失效问题。

3. **iframe 支持**  
   可选的 `detectIframe` 选项通过监听 `blur` 事件，检测焦点移到 iframe 的情况，扩展了适用范围。

4. **性能优化**  
   使用 `passive: true` 提高滚动性能，避免阻塞主线程。

## 五、使用场景与注意事项

### 场景

- 关闭浮动菜单或模态框。
- 检测用户交互区域，触发特定逻辑。

### 注意事项

- 如果目标元素动态变化，确保传入的 `target` 是响应式的（例如 Vue 的 `ref`）。
- 在 SSR 环境中，需确保 `window` 存在，否则函数会返回 `noop`。

## 六、总结

`onClickOutside` 是 VueUse 中一个优雅且功能强大的工具，通过巧妙的事件监听和兼容性处理，解决了前端开发中的常见需求。其源码展示了类型安全、性能优化和跨平台支持的优秀实践。希望这篇解读能帮助你更好地理解和使用它！
