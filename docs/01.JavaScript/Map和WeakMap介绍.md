<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2024-08-05 17:44:13
 * @FilePath: \VitePress\docs\01.JavaScript\Map和WeakMap介绍.md
-->

# JavaScript中的Map与WeakMap：深入解析与应用场景

在JavaScript中，对象（`Object`）是最常用的键值对数据结构，但它存在一些局限性，例如键只能为字符串或`Symbol`类型，且无法直接统计键值对的数量。为了解决这些问题，ES6引入了**Map**和**WeakMap**。本文将详细解析它们的特性、区别以及实际应用场景。

---

## 一、Map：强大的键值对集合

### 1. 基本特性
- **键可以是任意类型**：与普通对象不同，`Map`允许键为对象、函数、数字等任意值。
- **有序性**：`Map`会记录键值对的插入顺序，遍历时按插入顺序返回。
- **可迭代性**：支持`for...of`、`forEach`等方法直接遍历。
- **大小统计**：通过`size`属性快速获取键值对数量。

### 2. 基本操作
```javascript
// 创建Map
const map = new Map();

// 添加键值对
map.set('name', 'Alice');
map.set({ id: 1 }, 'User Object');
map.set(10, 'Number Key');

// 获取值
map.get('name'); // 'Alice'

// 删除键值对
map.delete(10);

// 判断键是否存在
map.has('name'); // true

// 遍历
map.forEach((value, key) => {
  console.log(key, value);
});
```

### 3. 使用场景
- **需要复杂类型的键**：例如用对象作为键来关联额外数据。
- **频繁增删键值对**：`Map`的增删操作性能优于普通对象。
- **需要维护插入顺序**：如实现缓存策略（LRU）。

---

## 二、WeakMap：弱引用的键值对集合

### 1. 核心特性
- **键必须是对象**：`WeakMap`的键只能是对象（包括数组、函数等）。
- **弱引用机制**：键是弱引用，不会阻止垃圾回收（GC）。如果键对象被回收，对应的值也会被自动清除。
- **不可枚举**：不支持遍历操作（如`forEach`、`keys()`）和`size`属性。

### 2. 基本操作
```javascript
const weakMap = new WeakMap();

const user = { id: 1 };
const data = { score: 100 };

// 添加键值对
weakMap.set(user, data);

// 获取值
weakMap.get(user); // { score: 100 }

// 删除键值对
weakMap.delete(user);
```

### 3. 使用场景
- **对象元数据存储**：为对象关联私有数据，避免内存泄漏。
- **缓存系统**：当键对象不再需要时，自动清理相关数据。
- **DOM元素关联**：将DOM节点作为键存储附加信息，节点移除后数据自动释放。

---

## 三、Map vs WeakMap：关键区别

| 特性                | Map                            | WeakMap                          |
|---------------------|--------------------------------|----------------------------------|
| 键的类型             | 任意类型                       | 仅对象                           |
| 垃圾回收影响         | 键强引用，阻止GC回收           | 键弱引用，不阻止GC回收            |
| 遍历方法             | 支持`forEach`、`for...of`等    | 不支持遍历                        |
| `size`属性           | 有                             | 无                               |
| 内存泄漏风险         | 需手动删除无用的键值对         | 自动释放                          |

---

## 四、实际应用示例

### 场景1：使用Map统计用户点击次数
```javascript
const clickCounts = new Map();

function trackClick(button) {
  const count = clickCounts.get(button) || 0;
  clickCounts.set(button, count + 1);
}
```

### 场景2：WeakMap实现私有属性
```javascript
const privateData = new WeakMap();

class User {
  constructor(name) {
    privateData.set(this, { name });
  }

  getName() {
    return privateData.get(this).name;
  }
}

const user = new User('Bob');
user.getName(); // 'Bob'
// 当user实例被销毁时，关联的私有数据自动释放
```

---

## 五、总结

- **优先使用Map**：当需要遍历、统计大小或键为非对象类型时。
- **选择WeakMap**：当键为对象且需要避免内存泄漏时（如关联元数据、缓存）。

通过合理选择`Map`和`WeakMap`，可以提升代码的可维护性和性能。理解它们的底层机制，将帮助你在复杂场景下做出更优的设计决策。