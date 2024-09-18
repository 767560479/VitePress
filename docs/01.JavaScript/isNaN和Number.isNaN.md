<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2024-07-04 19:25:16
 * @FilePath: \VitePress\docs\01.JavaScript\isNaN和Number.isNaN.md
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-09-18 15:12:16
-->

# isNaN 和 Number.isNaN

`isNaN` 和 `Number.isNaN` 都是用来检查一个值是否是 `NaN`（Not a Number），但它们在行为上有一些关键的区别：

1. **`isNaN` 函数**：

   - 它是全局对象的一个方法，这意味着它在全局作用域下可用，而不需要引用 `Number` 构造函数。
   - `isNaN` 函数接受一个参数，并检查这个参数是否是 `NaN`。
   - 然而，`isNaN` 函数有一个问题：如果传入的参数不是数字，它会尝试将该参数转换为数字，如果转换失败，它将返回 `true`。这意味着像 `"hello"` 这样的非数字字符串也会被错误地识别为 `NaN`。

   **示例**：

   ```javascript
   console.log(isNaN('hello')) // true, 因为 "hello" 转换为数字失败
   console.log(isNaN(0 / 0)) // true, 因为 0/0 是 NaN
   ```

2. **`Number.isNaN` 方法**：

   - 它是 `Number` 构造函数的一个静态方法，因此需要通过 `Number.isNaN` 来调用。
   - `Number.isNaN` 也接受一个参数，并检查这个参数是否是 `NaN`。
   - 与 `isNaN` 不同的是，`Number.isNaN` 不会尝试将非数字参数转换为数字。如果传入的参数不是数字，它将直接返回 `false`。

   **示例**：

   ```javascript
   console.log(Number.isNaN('hello')) // false, 因为 "hello" 不是 NaN
   console.log(Number.isNaN(0 / 0)) // true, 因为 0/0 是 NaN
   ```

**总结**：

- 使用 `Number.isNaN` 是更安全的选择，因为它不会错误地将非数字值识别为 `NaN`。
- `isNaN` 由于其转换行为，可能会导致一些意外的结果，因此在 ES6 之后，推荐使用 `Number.isNaN`。
