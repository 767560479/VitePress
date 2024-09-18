<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2024-01-15 23:05:08
 * @FilePath: \VitePress\docs\01.JavaScript\Reflect.md
 * @LastEditors: zhengfei.tan
 * @LastEditTime: 2024-01-15 23:24:19
-->

# Reflect

## 1. 概述

Reflect 对象与 Proxy 对象一样，也是 ES6 为了操作对象而提供的新 API。Reflect 对象的设计目的有这样几个。

（1） 将 Object 对象的一些明显属于语言内部的方法（比如 Object.defineProperty），放到 Reflect 对象上。现阶段，某些方法同时在 Object 和 Reflect 对象上部署，未来的新方法将只部署在 Reflect 对象上。也就是说，从 Reflect 对象上可以拿到语言内部的方法。

（2） 修改某些 Object 方法的返回结果，让其变得更合理。比如，Object.defineProperty(obj, name, desc)在无法定义属性时，会抛出一个错误，而 Reflect.defineProperty(obj, name, desc)则会返回 false。

（3） 让 Object 操作都变成函数行为。某些 Object 操作是命令式，比如 name in obj 和 delete obj[name ]，而 Reflect.has(obj, name)和 Reflect.deleteProperty(obj, name)让它们变成了函数行为。

（4） Reflect 对象的方法与 Proxy 对象的方法一一对应，只要是 Proxy 对象的方法，就能在 Reflect 对象上找到对应的方法。这就让 Proxy 对象可以方便地调用对应的 Reflect 方法，完成默认行为，作为修改行为的基础。也就是说，不管 Proxy 如何修改默认行为，你总可以在 Reflect 上获取默认行为。

```js
// 老写法
try {
  Object.defineProperty(target, property, attributes)
} catch (e) {
  // ...
}

// 新写法
if (Reflect.defineProperty(target, property, attributes)) {
  // ...
}
```

上面代码中，如果 Reflect.defineProperty()抛出错误，就可以知道操作是否成功。

## 2. Reflect.get()

Reflect.get()方法查找并返回 target 对象的 name 属性，如果没有该属性，则返回 undefined。

```js
var myObject = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar
  },
}

Reflect.get(myObject, 'foo') // 1
Reflect.get(myObject, 'bar') // 2
Reflect.get(myObject, 'baz') // 3
Reflect.get(myObject, 'quux') // undefined
```

Reflect.get()方法可以接受第二个参数，用来绑定 this。

```js
const myObject = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar
  },
}

const myReceiverObject = {
  foo: 4,
  bar: 4,
}

Reflect.get(myObject, 'baz', myReceiverObject) // 8
```

上面代码中，myReceiverObject 对象是 baz 属性的 this 对象，所以 baz 的返回值是 4+4。

如果第一个参数不是对象，Reflect.get()会报错。

```js
Reflect.get(1, 'foo') // 报错
Reflect.get(false, 'foo') // 报错
```

## 3. Reflect.set()

Reflect.set()方法设置 target 对象的 name 属性等于 value。

```js
var myObject = {
  foo: 1,
  set bar(value) {
    return (this.foo = value)
  },
}

myObject.foo // 1

Reflect.set(myObject, 'foo', 2)
myObject.foo // 2

Reflect.set(myObject, 'bar', 3)
myObject.foo // 3
```

如果 Proxy 对象和 Reflect 对象联合使用，前者拦截赋值操作，后者完成赋值操作。

```js
var handler = {
  set(target, name, value, receiver) {
    var success = Reflect.set(target, name, value, receiver)
    if (success) {
      console.log('property ' + name + ' on ' + target + ' set to ' + value)
    }
    return success
  },
}

var target = {}
var proxy = new Proxy(target, handler)

proxy.foo = 'bar'
// 输出：
// property foo on Proxy set to bar
```

上面代码中，Proxy.set()方法拦截了 target 对象的赋值操作，赋值操作执行的是 Reflect.set()。

Reflect.set()的返回值就是 success。

## 4. Reflect.has()

Reflect.has()方法对应 name in obj 里面的 in 运算符。

```js
var myObject = {
  foo: 1,
}

// 旧写法
'foo' in myObject // true

// 新写法
Reflect.has(myObject, 'foo') // true
```

Reflect.has()方法还可以用来操作属性。

```js
var myObject = {
  foo: 1,
  bar: undefined,
  [Symbol('baz')]: 42,
}

// 旧写法
'foo' in myObject // true
'bar' in myObject // true
'baz' in myObject // true

// 新写法
Reflect.has(myObject, 'foo') // true
Reflect.has(myObject, 'bar') // true
Reflect.has(myObject, 'baz') // true
```

## 5. Reflect.deleteProperty()

Reflect.deleteProperty()方法等同于 delete obj[name]，用于删除对象的属性。

```js
const myObj = {}

Object.defineProperty(myObj, 'hidden', {
  value: true,
  enumerable: false,
})

myObj.hidden // true
Reflect.deleteProperty(myObj, 'hidden') // true
myObj.hidden // undefined
```

上面代码中，myObj 对象的 hidden 属性是只读的，Object.defineProperty()无法删除该属性，但是 Reflect.deleteProperty()可以做到。

## 6. Reflect.construct()

Reflect.construct()方法等同于 new target(...args)，这提供了一种不使用 new，来调用构造函数的方法。

## 7. Reflect.getPrototypeOf()

Reflect.getPrototypeOf()方法用于读取对象的**proto**属性，对应 Object.getPrototypeOf()方法。

```js
const myObj = new FancyThing()

// 旧写法
Object.getPrototypeOf(myObj) === FancyThing.prototype // true

// 新写法
Reflect.getPrototypeOf(myObj) === FancyThing.prototype // true
```

## 8. Reflect.setPrototypeOf()

Reflect.setPrototypeOf()方法用于设置对象的**proto**属性，返回第一个参数对象。它相当于 Object.setPrototypeOf(obj, newProto)，用来设置一个对象的原型（prototype）对象，返回第一个参数对象。

```js
const myObj = new FancyThing()

// 旧写法
Object.setPrototypeOf(myObj, anotherObj) === myObj // true

// 新写法
Reflect.setPrototypeOf(myObj, anotherObj) === myObj // true
```

## 9. Reflect.apply()

Reflect.apply()方法等同于 Function.prototype.apply.call(func, thisArg, args)，用于绑定 this 对象后执行给定函数。

## 10. Reflect.ownKeys()

是 JavaScript 中的一个内置方法，它用于获取一个对象的所有属性键（包括原型链上的属性）。这个方法在 JavaScript 的 ECMAScript 6（ES6）中引入，并在后续的版本中得到了扩展。

Reflect.ownKeys 方法的语法如下：

```js
Reflect.ownKeys(target)
```

其中，target 参数是要获取所有属性键的对象。

Reflect.ownKeys 方法返回一个包含对象所有属性键的数组。
