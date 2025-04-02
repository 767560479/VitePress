---
top: 10
sticky: 1000
sidebar:
  title: useLocalStorage&useSessionStorage源码解析
  isTimeLine: true
title: useLocalStorage&useSessionStorage源码解析
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
 * @Date: 2025-03-31 23:01:07
 * @FilePath: \VitePress\docs\VueuseSource\useLocalStorage&useSessionStorage源码解析.md
-->

# VueUse useLocalStorage & useSessionStorage 源码解析及使用指南

## 一、核心定位与关系

### 1. 与 useStorage 的关系

```typescript
// 源码实现关系
const useLocalStorage = (key: string, initialValue: any, options?: UseStorageOptions) =>
  useStorage(key, initialValue, localStorage, options)

const useSessionStorage = (key: string, initialValue: any, options?: UseStorageOptions) =>
  useStorage(key, initialValue, sessionStorage, options)
```

### 2. 特性对比

| 特性         | useLocalStorage    | useSessionStorage  |
| ------------ | ------------------ | ------------------ |
| 数据生命周期 | 永久存储           | 会话级别           |
| 作用域       | 同源共享           | 单个标签页         |
| 典型应用场景 | 用户偏好设置       | 临时会话状态       |
| 存储容量     | 通常 5MB           | 通常 5MB           |
| 数据持久性   | 手动清除或过期策略 | 标签页关闭自动清除 |

## 二、核心源码解析

### 1. 函数签名

```typescript
// useLocalStorage
function useLocalStorage<T>(
  key: string,
  initialValue: MaybeRef<T>,
  options?: UseStorageOptions<T>
): RemovableRef<T>

// useSessionStorage
function useSessionStorage<T>(
  key: string,
  initialValue: MaybeRef<T>,
  options?: UseStorageOptions<T>
): RemovableRef<T>
```

### 2. 源码实现（v9.0.0）

```typescript
// 浏览器环境检测
const isClient = typeof window !== 'undefined'

// useLocalStorage 实现
export function useLocalStorage<T extends string | number | boolean | object | null>(
  key: string,
  initialValue: T,
  options: UseStorageOptions<T> = {}
) {
  return useStorage(key, initialValue, isClient ? localStorage : undefined, options)
}

// useSessionStorage 实现
export function useSessionStorage<T extends string | number | boolean | object | null>(
  key: string,
  initialValue: T,
  options: UseStorageOptions<T> = {}
) {
  return useStorage(key, initialValue, isClient ? sessionStorage : undefined, options)
}
```

## 三、关键技术实现

### 1. 存储类型自动切换

```typescript
// 服务端渲染处理
const storage = isClient ? targetStorage : undefined

// 隐私模式降级处理
try {
  storage!.setItem(testKey, 'test')
  storage!.removeItem(testKey)
} catch (e) {
  fallbackToMemoryStorage()
}
```

### 2. 类型约束增强

```typescript
// 参数类型校验
T extends(string|number|boolean|object|null)
```

### 3. 存储事件响应

```typescript
// 跨窗口同步实现
window.addEventListener('storage', event => {
  if (event.key === key && event.storageArea === storage) {
    updateState(event)
  }
})
```

## 四、使用示例大全

### 1. 基础使用

```typescript
// 持久化用户主题设置
const theme = useLocalStorage('user-theme', 'light')

// 会话级购物车数据
const cartItems = useSessionStorage('shopping-cart', [])

// 类型安全示例
interface UserSettings {
  darkMode: boolean
  fontSize: number
}
const settings = useLocalStorage<UserSettings>('settings', {
  darkMode: true,
  fontSize: 14,
})
```

### 2. 高级配置

```typescript
// 自定义序列化（日期处理）
const dateSerializer = {
  read: (v: string) => new Date(parseInt(v)),
  write: (v: Date) => v.getTime().toString(),
}

const lastLogin = useLocalStorage('last-login', new Date(), {
  serializer: dateSerializer,
})

// 写操作节流控制
const analyticsData = useLocalStorage('analytics', [], {
  flush: 'post',
  deep: true,
})
```

### 3. 服务端渲染处理

```typescript
// Nuxt.js 集成示例
export const usePersistedState = (key: string, init: any) => {
  const cookie = useCookie(key)
  return process.client ? useLocalStorage(key, init) : ref(cookie.value || init)
}
```

## 五、实现原理图解

```
[Vue Component]
  → 调用 useLocalStorage(key)
    → 触发 useStorage 初始化
      → 检测 localStorage 可用性
        → 成功：建立响应式绑定
        → 失败：降级内存存储
      → 注册 storage 事件监听器
  ↔ 数据变更双向同步
```

## 六、注意事项与最佳实践

### 1. 安全实践

```typescript
// 敏感信息加密存储
const encryptSerializer = {
  read: (v: string) => decrypt(v),
  write: (v: any) => encrypt(JSON.stringify(v)),
}

const token = useLocalStorage('auth-token', null, {
  serializer: encryptSerializer,
})
```

### 2. 性能优化

```typescript
// 大数据分块存储
const LARGE_DATA_KEY = 'large-data'
const chunkSize = 1024 * 1024 // 1MB

const saveLargeData = (data: string) => {
  const chunks = data.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || []
  useLocalStorage(`${LARGE_DATA_KEY}-chunks`, chunks.length)
  chunks.forEach((chunk, i) => {
    useLocalStorage(`${LARGE_DATA_KEY}-${i}`, chunk)
  })
}
```

### 3. 错误处理

```typescript
// 存储失败降级示例
const persistentState = useLocalStorage(
  'important-data',
  {},
  {
    onError: e => {
      console.error('存储失败，降级内存存储:', e)
      // 显示用户提示
      showToast('本地存储不可用，部分功能受限')
    },
  }
)
```

## 七、特殊场景处理

### 1. 隐私模式兼容

```typescript
// 隐私模式检测
const checkStorageAvailable = () => {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

const safeLocalStorage = checkStorageAvailable()
  ? useLocalStorage
  : (key: string, init: any) => ref(init)
```

### 2. 跨标签页通信

```typescript
// 实现标签页间消息广播
const useTabBroadcast = (channel: string) => {
  const message = useLocalStorage(channel, null)
  const postMessage = (data: any) => (message.value = data)
  const clearMessage = () => (message.value = null)
  return { message, postMessage, clearMessage }
}
```

## 八、对比分析

### 与原生 API 对比

| 功能       | 原生实现              | VueUse 实现    |
| ---------- | --------------------- | -------------- |
| 响应式更新 | 手动监听 storage 事件 | 自动同步       |
| 类型转换   | 需手动 JSON 处理      | 自动序列化     |
| 深层次监听 | 不支持                | 支持 deep 配置 |
| 错误处理   | 需手动 try/catch      | 内置降级策略   |
| 服务端渲染 | 无法直接使用          | 安全降级处理   |

## 九、扩展应用

### 1. 实现过期机制

```typescript
const useExpirableStorage = (key: string, ttl: number) => {
  const data = useLocalStorage<{ value: any; expires: number }>(key, null)

  const set = (value: any) => {
    data.value = {
      value,
      expires: Date.now() + ttl,
    }
  }

  const get = () => {
    if (!data.value) return null
    if (Date.now() > data.value.expires) {
      data.value = null
      return null
    }
    return data.value.value
  }

  return { get, set }
}
```

### 2. 存储空间监控

```typescript
const useStorageQuota = () => {
  const calculateUsage = (storage: Storage) => {
    let total = 0
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)!
      total += (storage.getItem(key)?.length || 0) * 2 // 字节计算
    }
    return total
  }

  return {
    localStorageUsage: () => calculateUsage(localStorage),
    sessionStorageUsage: () => calculateUsage(sessionStorage),
  }
}
```

## 十、总结

### 适用场景建议

- 🏷️ **useLocalStorage 适用**：

  - 需要长期保存的用户设置
  - 跨会话持久化数据
  - 离线功能数据缓存

- 🕶️ **useSessionStorage 适用**：
  - 敏感临时数据（如购物车）
  - 单页应用流程状态保持
  - 避免多标签页数据干扰

### 性能优化要点

1. 避免存储大型对象（超过 1MB）
2. 高频更新操作使用 `flush: 'post'`
3. 禁用不必要的 deep 监听
4. 及时清理过期数据

### 安全建议

1. 不要存储敏感信息明文
2. 对用户输入进行严格过滤
3. 使用 HTTPS 防止中间人攻击
4. 定期清理第三方库的存储数据

通过合理使用这两个 API，可以在保证数据持久化的同时，保持应用状态的响应式同步，极大提升开发效率和用户体验。
