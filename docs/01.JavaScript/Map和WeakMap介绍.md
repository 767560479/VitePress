<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2024-08-05 17:44:13
 * @FilePath: \VitePress\docs\01.JavaScript\Map和WeakMap介绍.md
-->

# Map 和 WeakMap 介绍

Map 和 WeakMap 是 JavaScript 中的两种集合类型，它们提供了存储键值对的方式，但它们之间有一些关键的区别和不同的使用场景。

## Map

1. **定义**：Map 是一个集合，可以存储键值对的有序列表。键可以是任何类型的值。
2. **特性**：
   - 键值对是有序的，即它们按照添加的顺序被迭代。
   - 键可以是任何类型，包括对象、函数、甚至另一个 Map。
   - 提供了丰富的 API，例如 `set`, `get`, `has`, `delete`, `clear` 和 `size`。

## WeakMap

1. **定义**：WeakMap 是一个集合，同样可以存储键值对，但它的键必须是对象引用，并且这些引用是弱引用。
2. **特性**：
   - 键必须是对象引用，不能是原始类型（如数字、字符串或布尔值）。
   - 键是弱引用，这意味着如果键的对象没有其他引用指向它，那么 WeakMap 会自动释放该键值对，允许垃圾回收器回收内存。
   - 不可迭代，没有 `size` 属性，也没有 `clear` 方法。

### 相同点

- 都是用来存储键值对的集合。
- 都提供了 `get`, `set`, `has`, `delete` 方法。

### 不同点

- **键的类型**：Map 可以接受任何类型的键，而 WeakMap 的键必须是对象引用。
- **内存管理**：Map 的键值对不会自动释放，而 WeakMap 的键值对会在键所指向的对象被垃圾回收时自动释放。
- **迭代**：Map 是可迭代的，可以知道集合的大小；WeakMap 不可迭代，也没有 `size` 属性。
- **用途**：Map 更通用，适用于需要有序键值对存储的情况；WeakMap 适合用于缓存或私有数据存储，当对象不再被使用时，可以自动清理。

### 应用场景

- **Map**：

  - 当你需要存储和管理一个有序的键值对集合时。
  - 当键的类型不局限于对象引用时。

- **WeakMap**：
  - 当你需要自动管理内存，避免内存泄漏时，例如缓存机制。
  - 当键是对象，并且你不希望因为 WeakMap 的存在而阻止对象被垃圾回收时。

### 代码示例

以下是 Map 和 WeakMap 的基本使用示例：

```javascript
// 使用 Map
const map = new Map()
map.set('key', 'value')
console.log(map.get('key')) // 输出 'value'

// 使用 WeakMap
const weakMap = new WeakMap()
const keyObject = {}
weakMap.set(keyObject, 'value')
console.log(weakMap.get(keyObject)) // 输出 'value'
// 如果 keyObject 没有其他引用，它将被垃圾回收，weakMap 中的条目也会被自动删除。
```
