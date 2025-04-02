---
top: 3
sticky: 1000
sidebar:
  title: useDateFormat源码解析
  isTimeLine: true
title: useDateFormat源码解析
date: 2025-04-02
tags:
  - 前端
  - javascript
  - 源码
  - VueUse
categories:
  - 前端
---

# 深入解析 VueUse 的 `useDateFormat`：源码解读与使用示例

在前端开发中，日期格式化是一个常见的任务，无论是展示时间戳、格式化用户输入的日期，还是处理国际化时间显示，开发者都需要一个简单而灵活的工具。VueUse 是一个专为 Vue 3 设计的实用工具库，其中的 `useDateFormat` 提供了一种响应式的日期格式化解决方案。本文将深入分析 `useDateFormat` 的源码实现，并结合实际使用示例，帮助你更好地理解和应用这一工具。

---

## `useDateFormat` 简介

`useDateFormat` 是一个基于 Vue 3 组合式 API 的 Hook，用于将日期对象或时间戳格式化为指定的字符串。它基于 JavaScript 的 `Intl.DateTimeFormat` API，支持灵活的格式化选项和国际化需求。基本用法如下：

```javascript
import { useDateFormat } from '@vueuse/core'

const date = new Date()
const formatted = useDateFormat(date, 'YYYY-MM-DD HH:mm:ss')
console.log(formatted.value) // 输出类似 "2025-04-02 14:30:00"
```

在这个例子中，我们将当前日期格式化为 `YYYY-MM-DD HH:mm:ss` 的字符串。

---

## 源码解读

以下是 `useDateFormat` 的简化源码实现（基于 VueUse v10.x，具体实现请参考官方仓库）：

```javascript
import { ref, computed, watch, isRef } from 'vue'
import { isString, isDate } from '@vueuse/shared'

export function useDateFormat(date, format = 'YYYY-MM-DD', options = {}) {
  // 处理输入的日期
  const dateRef = isRef(date) ? date : ref(date)

  // 默认选项
  const {
    locales = 'en-US', // 默认语言环境
    ...intlOptions // 其他 Intl.DateTimeFormat 选项
  } = options

  // 格式化函数
  const formatter = (value, fmt) => {
    if (!value) return ''

    let dateValue = value
    if (isString(value)) {
      dateValue = new Date(value)
    } else if (!isDate(value)) {
      dateValue = new Date(value)
    }

    if (isNaN(dateValue.getTime())) return ''

    // 如果是自定义格式字符串
    if (fmt.includes('Y') || fmt.includes('M') || fmt.includes('D')) {
      return formatCustom(dateValue, fmt)
    }

    // 使用 Intl.DateTimeFormat 格式化
    return new Intl.DateTimeFormat(locales, intlOptions).format(dateValue)
  }

  // 自定义格式化逻辑
  const formatCustom = (date, fmt) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return fmt
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  // 响应式格式化结果
  const output = computed(() => formatter(dateRef.value, format))

  return output
}
```

### 源码关键点解析

1. **输入处理**：

   - `date` 参数可以是 `Date` 对象、时间戳、字符串或响应式 `ref`。
   - 使用 `isRef` 判断输入是否为 `ref`，如果是则直接使用，否则包装为 `ref`。

2. **格式化逻辑**：

   - 如果 `format` 是自定义字符串（如 `YYYY-MM-DD`），调用 `formatCustom` 进行替换。
   - 如果 `format` 未包含自定义占位符，则使用 `Intl.DateTimeFormat` 进行格式化，支持国际化。

3. **自定义格式化**：

   - `formatCustom` 通过 `getFullYear`、`getMonth` 等方法提取日期组件，并用 `padStart` 补齐两位数。
   - 支持的占位符包括 `YYYY`（年）、`MM`（月）、`DD`（日）、`HH`（小时）、`mm`（分钟）、`ss`（秒）。

4. **响应式支持**：

   - 使用 `computed` 返回格式化结果，确保当 `dateRef` 或 `format` 变化时，输出自动更新。

5. **国际化支持**：
   - 通过 `locales` 和 `intlOptions` 参数，可以利用 `Intl.DateTimeFormat` 实现不同语言环境下的格式化。

---

## 使用示例

下面是一个实际的 Vue 组件示例，展示如何使用 `useDateFormat` 实现动态日期格式化：

```vue
<template>
  <div>
    <p>当前时间：{{ formattedDate }}</p>
    <input v-model="format" placeholder="输入格式，如 YYYY-MM-DD HH:mm:ss" />
    <button @click="updateDate">刷新时间</button>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useDateFormat } from '@vueuse/core'

  const date = ref(new Date())
  const format = ref('YYYY-MM-DD HH:mm:ss')

  const formattedDate = useDateFormat(date, format)

  const updateDate = () => {
    date.value = new Date() // 更新日期，触发重新格式化
  }
</script>

<style scoped>
  input {
    margin: 10px;
    padding: 5px;
  }
  button {
    padding: 5px 10px;
  }
</style>
```

### 示例说明

1. **功能**：

   - 显示当前时间的格式化结果。
   - 用户可以输入自定义格式（如 `YYYY-MM-DD` 或 `HH:mm:ss`），实时更新显示。
   - 点击“刷新时间”按钮更新日期。

2. **效果**：
   - 当 `date` 或 `format` 变化时，`formattedDate` 会自动重新计算并更新。
   - 输入 `YYYY-MM-DD` 会显示类似 `2025-04-02`，输入 `HH:mm:ss` 会显示类似 `14:30:45`。

---

## 扩展与优化

1. **国际化格式化**：
   使用 `locales` 参数支持不同语言环境：

   ```javascript
   const formatted = useDateFormat(new Date(), 'YYYY-MM-DD', { locales: 'zh-CN' })
   console.log(formatted.value) // 输出类似 "2025-04-02"
   ```

2. **使用 `Intl` 标准选项**：
   如果不需要自定义格式，可以直接使用 `Intl.DateTimeFormat` 的选项：

   ```javascript
   const formatted = useDateFormat(new Date(), '', {
     locales: 'en-US',
     dateStyle: 'full',
   })
   console.log(formatted.value) // 输出类似 "Wednesday, April 2, 2025"
   ```

3. **动态切换格式**：
   将 `format` 定义为响应式变量，动态切换格式：

   ```javascript
   const format = ref('YYYY-MM-DD')
   const formatted = useDateFormat(new Date(), format)
   format.value = 'HH:mm:ss' // 切换为时间格式
   ```

4. **错误处理**：
   如果传入无效日期，`useDateFormat` 会返回空字符串：
   ```javascript
   const formatted = useDateFormat('invalid-date', 'YYYY-MM-DD')
   console.log(formatted.value) // 输出 ""
   ```

---

## 与其他工具的对比

相比传统的日期格式化库（如 `moment.js` 或 `day.js`），`useDateFormat` 有以下优势：

- **轻量**：无需引入额外的依赖，直接基于原生 API。
- **响应式**：与 Vue 的响应式系统无缝集成。
- **灵活性**：支持自定义格式和国际化。

但它也有局限性，例如不支持过于复杂的格式化规则（如 `moment.js` 的 `fromNow`），适合轻量级场景。

---

## 总结

`useDateFormat` 是 VueUse 中一个简单而实用的工具，通过结合自定义格式化和 `Intl.DateTimeFormat`，它为开发者提供了灵活的日期格式化能力。本文的源码分析和示例展示了它的核心原理和应用场景，希望能帮助你在项目中更高效地处理日期相关需求。
