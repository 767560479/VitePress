<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2024-07-04 19:25:16
 * @FilePath: \VitePress\docs\01.JavaScript\isNaN和Number.isNaN.md
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-03-25 22:54:56
-->

# 深入剖析 JavaScript 中的 `Number.isNaN` 和 `isNaN`：区别与应用场景

在 JavaScript 中，处理数字时经常会遇到需要判断某个值是否为 `NaN`（Not-a-Number）的情况。为此，JavaScript 提供了两个工具：全局函数 `isNaN` 和 `Number.isNaN` 方法。尽管它们看起来功能相似，但实际上在实现和行为上有着显著的区别。本文将深入探讨这两者的差异，分析它们的底层逻辑，并提供实际使用建议。

#### 什么是 `NaN`？

在开始之前，先简单了解一下 `NaN`。`NaN` 是 JavaScript 中的一个特殊值，表示“非数字”。它通常出现在无效的数学运算中，比如 `0 / 0` 或试图将非数字字符串转换为数字（如 `parseInt("abc")`）。有趣的是，`NaN` 不等于自身（`NaN === NaN` 返回 `false`），这使得判断一个值是否为 `NaN` 需要特别的方法。

#### `isNaN`：全局函数的宽松判断

`isNaN` 是 JavaScript 从早期就存在的一个全局函数。它的作用是判断一个值是否“不可转换为数字”。但它的行为却比表面看起来要复杂得多。

- **工作原理**：`isNaN` 会先尝试将传入的值强制转换为数字（通过隐式类型转换，类似于 `Number()`），然后判断结果是否为 `NaN`。
- **代码示例**：
  ```javascript
  console.log(isNaN(NaN)) // true
  console.log(isNaN(123)) // false
  console.log(isNaN('123')) // false，因为 "123" 可转为 123
  console.log(isNaN('abc')) // true，因为 "abc" 转为 NaN
  console.log(isNaN(undefined)) // true，因为 undefined 转为 NaN
  console.log(isNaN({})) // true，因为对象转为 NaN
  ```
- **关键特点**：`isNaN` 的宽松性在于它会对参数进行类型转换。这种特性虽然有时方便，但也带来了潜在的问题——它可能会误判一些非 `NaN` 的值。例如，`isNaN("abc")` 返回 `true`，但 `"abc"` 本身并不是 `NaN`，只是无法转换为有效数字。

#### `Number.isNaN`：严格的原值检查

`Number.isNaN` 是 ECMAScript 2015（ES6）引入的一个更现代的方法，挂在 `Number` 对象下。它的行为更加精确和可预测。

- **工作原理**：`Number.isNaN` 不会对传入的值进行类型转换，而是直接检查它是否严格等于 `NaN`。换句话说，只有当值本身就是 `NaN` 时，它才会返回 `true`。
- **代码示例**：
  ```javascript
  console.log(Number.isNaN(NaN)) // true
  console.log(Number.isNaN(123)) // false
  console.log(Number.isNaN('123')) // false，因为 "123" 不是 NaN
  console.log(Number.isNaN('abc')) // false，因为 "abc" 不是 NaN
  console.log(Number.isNaN(undefined)) // false，因为 undefined 不是 NaN
  console.log(Number.isNaN({})) // false，因为对象不是 NaN
  ```
- **关键特点**：`Number.isNaN` 的严格性避免了类型转换带来的副作用。只有当值已经是 `NaN` 时（比如通过数学运算或 `Number()` 转换生成的 `NaN`），它才会返回 `true`。

#### 核心区别

通过上面的例子，我们可以总结出 `isNaN` 和 `Number.isNaN` 的主要区别：

1. **类型转换**：

   - `isNaN`：会对参数进行隐式类型转换，判断转换后的结果是否为 `NaN`。
   - `Number.isNaN`：不进行类型转换，直接检查值是否为 `NaN`。

2. **返回值范围**：

   - `isNaN`：对任何“不可转换为数字”的值返回 `true`，包括 `undefined`、`{}` 等。
   - `Number.isNaN`：只对严格等于 `NaN` 的值返回 `true`。

3. **历史背景**：
   - `isNaN` 是 JavaScript 早期的全局函数，存在历史包袱。
   - `Number.isNaN` 是 ES6 新增的，设计上更符合现代编程需求。

#### 实际应用场景

- **使用 `isNaN`**：
  如果你需要判断一个值是否“不可用作数字”（比如用户输入的字符串），`isNaN` 可能是更方便的选择。例如：

  ```javascript
  const userInput = 'hello'
  if (isNaN(userInput)) {
    console.log('请输入有效数字！')
  }
  ```

  但需要注意，它可能会把一些非 `NaN` 的值也归为“不可用”。

- **使用 `Number.isNaN`**：
  如果你只关心值本身是否严格为 `NaN`（比如检查数学运算的结果），`Number.isNaN` 是更好的选择。例如：
  ```javascript
  const result = 0 / 0
  if (Number.isNaN(result)) {
    console.log('运算结果无效！')
  }
  ```

#### 性能与实现细节

从性能上看，两者的差异不大，但在特定场景下，`Number.isNaN` 可能略快，因为它跳过了类型转换的步骤。从实现上看，`isNaN` 的行为类似于：

```javascript
function isNaNPolyfill(value) {
  return Number(value) !== Number(value) // NaN 是唯一不等于自身的
}
```

而 `Number.isNaN` 更像：

```javascript
function numberIsNaNPolyfill(value) {
  return typeof value === 'number' && value !== value
}
```

#### 总结

- **`isNaN`**：宽松、历史悠久，适用于需要检查“是否可转为数字”的场景，但容易误判。
- **`Number.isNaN`**：严格、现代，适用于精确判断值是否为 `NaN` 的场景，推荐在现代代码中使用。

在实际开发中，如果你追求代码的清晰性和可预测性，优先选择 `Number.isNaN`。但如果你需要兼容旧代码或处理更广泛的输入场景，`isNaN` 仍然有它的用武之地。理解两者的区别，能让你在不同情况下做出最佳选择！

---

这篇博客详细剖析了两者的区别，并结合代码示例和应用场景进行了说明，希望对你有所帮助！如果需要调整或补充内容，请随时告诉我。
