---
top: 10
sticky: 1000
sidebar:
  title: createInjectionState 方法：从源码到应用
  isTimeLine: true
title: createInjectionState 方法：从源码到应用
date: 2025-03-30
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
 * @Date: 2025-03-30 22:38:50
 * @FilePath: \VitePress\docs\VueuseSource\createInjectionState方法解读.md
-->

# 解读 VueUse 中的 `createInjectionState` 方法：从源码到应用

`createInjectionState` 是一个用于创建可注入状态的独特方法。它允许开发者在组件树中共享状态，而无需依赖传统的 `provide/inject` 手动实现。这种方法特别适合需要模块化、可复用的状态管理场景。今天，我们将通过分析其源码，深入理解 `createInjectionState` 的实现原理，并结合实际例子展示它的用法。

---

## `createInjectionState` 的基本概念

在 Vue 中，`provide` 和 `inject` 是一种跨组件层级传递数据的方式。然而，手动使用 `provide/inject` 时，开发者需要自己定义键名、管理状态，并在组件中显式调用这些 API。`createInjectionState` 通过封装这一过程，提供了一个更简洁、类型安全的解决方案。它返回一个 `[provider, use]` 对，其中 `provider` 用于提供状态，`use` 用于消费状态。

让我们先看一个简单的使用例子：

```javascript
import { createInjectionState } from '@vueuse/core'
import { ref } from 'vue'

// 创建一个可注入的状态
const [provideCounter, useCounter] = createInjectionState((initialValue = 0) => {
  const count = ref(initialValue)
  const increment = () => count.value++
  return { count, increment }
})

// 在父组件中使用 provider
export const ParentComponent = {
  setup() {
    provideCounter(10) // 提供初始值为 10 的计数器
  },
}

// 在子组件中使用 use
export const ChildComponent = {
  setup() {
    const counter = useCounter() // 获取注入的状态
    return { counter }
  },
}
```

在这个例子中，`provideCounter` 在父组件中提供了状态，而 `ChildComponent` 通过 `useCounter` 消费这个状态。接下来，我们将深入源码，揭示其实现细节。

---

## 源码剖析

`createInjectionState` 的源码位于 `vueuse/packages/core/createInjectionState/index.ts` 中。以下是其核心实现（简化了一些类型定义和边缘处理）：

### 1. 函数签名

```typescript
export function createInjectionState<T, R extends Record<string, any>>(
  factory: (...args: T[]) => R
): [(...args: T[]) => void, () => R | undefined]
```

- **`factory`**：一个工厂函数，接收任意参数并返回状态对象。这个对象将成为注入的内容。
- **返回值**：一个元组 `[provideFn, useFn]`：
  - `provideFn`：用于提供状态的函数。
  - `useFn`：用于消费状态的函数，如果未提供状态则返回 `undefined`。

### 2. 核心实现

```typescript
import { provide, inject } from 'vue'
import type { InjectionKey } from 'vue'

export function createInjectionState<T, R extends Record<string, any>>(
  factory: (...args: T[]) => R
): [(...args: T[]) => void, () => R | undefined] {
  // 创建唯一的 InjectionKey
  const injectionKey: InjectionKey<R> = Symbol('injection-state')

  // 定义 provider 函数
  function provideFn(...args: T[]) {
    const state = factory(...args)
    provide(injectionKey, state)
  }

  // 定义 use 函数
  function useFn() {
    const state = inject(injectionKey)
    return state
  }

  return [provideFn, useFn]
}
```

#### 关键点分析

1. **唯一的 `InjectionKey`**：

   - 使用 `Symbol('injection-state')` 创建一个唯一的注入键，避免与其他 `provide/inject` 调用冲突。这确保了状态的隔离性。

2. **`provideFn` 的作用**：

   - 调用工厂函数 `factory`，生成状态对象。
   - 使用 Vue 的 `provide` API 将状态注入到组件树中，键为 `injectionKey`。

3. **`useFn` 的作用**：

   - 使用 Vue 的 `inject` API 检索注入的状态。
   - 如果当前组件树中没有对应的状态提供者，则返回 `undefined`。

4. **简洁性与封装**：
   - 通过将 `provide` 和 `inject` 封装到一个函数对中，开发者无需手动管理键名或状态逻辑。

---

## 设计理念与优势

通过源码，我们可以总结 `createInjectionState` 的几个设计亮点：

1. **模块化与复用**：

   - 将状态逻辑封装到工厂函数中，使得状态可以独立定义并在多个地方复用。

2. **类型安全**：

   - 利用 TypeScript 的类型推导，`createInjectionState` 确保提供和消费的状态类型一致。

3. **零配置**：

   - 无需手动定义 `InjectionKey`，减少了样板代码。

4. **优雅的 API**：
   - 返回的 `[provideFn, useFn]` 元组符合函数式编程的风格，易于解构和使用。

---

## 实际应用场景

### 场景 1：简单的计数器状态管理

让我们扩展开头的例子，创建一个完整的计数器应用：

```javascript
// counter.ts
import { createInjectionState } from '@vueuse/core'
import { ref } from 'vue'

export const [provideCounter, useCounter] = createInjectionState((initialValue = 0) => {
  const count = ref(initialValue)
  const increment = () => count.value++
  const decrement = () => count.value--
  return { count, increment, decrement }
})

// Parent.vue
import { provideCounter } from './counter'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    provideCounter(5) // 提供初始值为 5 的计数器
  },
  template: `<div><child-component /></div>`,
})

// Child.vue
import { useCounter } from './counter'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ChildComponent',
  setup() {
    const counter = useCounter()
    if (!counter) throw new Error('Counter not provided!')
    return { counter }
  },
  template: `
    <div>
      <p>Count: {{ counter.count }}</p>
      <button @click="counter.increment">+1</button>
      <button @click="counter.decrement">-1</button>
    </div>
  `,
})
```

在这个例子中：

- `provideCounter` 在父组件中提供了一个计数器状态。
- 子组件通过 `useCounter` 消费这个状态，并提供了增减按钮。
- 如果没有提供状态，可以通过检查 `undefined` 来抛出错误或显示默认 UI。

### 场景 2：主题管理

另一个常见的用例是管理应用的主题：

```javascript
// theme.ts
import { createInjectionState } from '@vueuse/core'
import { ref } from 'vue'

export const [provideTheme, useTheme] = createInjectionState((defaultTheme = 'light') => {
  const theme = ref(defaultTheme)
  const toggle = () => (theme.value = theme.value === 'light' ? 'dark' : 'light')
  return { theme, toggle }
})

// App.vue
import { provideTheme } from './theme'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    provideTheme('light') // 提供默认主题
  },
  template: `<div><theme-switcher /></div>`,
})

// ThemeSwitcher.vue
import { useTheme } from './theme'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const themeState = useTheme()
    if (!themeState) throw new Error('Theme not provided!')
    return { themeState }
  },
  template: `
    <div :class="themeState.theme">
      <p>Current Theme: {{ themeState.theme }}</p>
      <button @click="themeState.toggle">Toggle Theme</button>
    </div>
  `,
})
```

在这个例子中：

- `provideTheme` 提供了一个主题状态和切换方法。
- 子组件通过 `useTheme` 获取并操作主题，实现了简单的主题切换功能。

---

## 注意事项与优化建议

1. **状态未提供的处理**：

   - `useFn` 返回值可能是 `undefined`，因此在消费状态时需要检查是否存在，或者提供默认值。例如：
     ```javascript
     const counter = useCounter() ?? { count: ref(0), increment: () => {} }
     ```

2. **作用域限制**：

   - `createInjectionState` 创建的状态只在调用 `provideFn` 的组件树中有效。如果需要在全局使用，可以在根组件中调用 `provideFn`。

3. **性能考虑**：
   - 如果状态对象较大且频繁变化，建议使用 `shallowRef` 优化响应式性能。

---

## 总结

通过对 `createInjectionState` 源码的解读，我们可以看到它是一个轻量而强大的工具，简化了 Vue 中状态注入的实现。它的设计优雅且实用，特别适合需要在组件间共享模块化状态的场景。无论是简单的计数器还是复杂的主题管理，`createInjectionState` 都能帮助开发者以更少的代码实现更多的功能。

如果你正在寻找一种轻量级的状态管理方案，不妨试试 `createInjectionState`，它可能会成为你工具箱中的新宠！

---

希望这篇博客能帮助你更好地理解和应用 `createInjectionState`！如果有任何问题或建议，欢迎留言交流。
