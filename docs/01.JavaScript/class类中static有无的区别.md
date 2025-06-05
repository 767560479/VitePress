---
top: 25
sticky: 1000
sidebar:
  title: class 类中 static 有无的区别
  isTimeLine: true
title: class 类中 static 有无的区别
date: 2025-06-06 21:22:00
tags:
  - 前端
  - javascript
categories:
  - 前端
---

# class 类中 static 有无的区别

在 JavaScript 的类中，使用 `static` 关键字定义成员（方法或字段）会使其成为**静态成员**，否则为**实例成员**。两者在访问方式、内存管理、使用场景等方面有显著差异。以下是详细对比：

---

### 一、核心区别概览

| **特性**     | **静态成员（使用 `static`）**            | **实例成员（不使用 `static`）**        |
| ------------ | ---------------------------------------- | -------------------------------------- |
| **归属对象** | 类本身（构造函数）                       | 类的实例（通过 `new` 创建的对象）      |
| **访问方式** | 通过类名访问（如 `ClassName.method()`）  | 通过实例访问（如 `instance.method()`） |
| **内存分配** | 类加载时初始化，全局唯一                 | 每创建一个实例，分配一次独立内存       |
| **访问权限** | 不能访问实例属性（无 `this` 指向实例）   | 可访问实例属性（`this` 指向当前实例）  |
| **继承行为** | 子类可继承，但私有静态成员仅定义类可访问 | 子类通过原型链继承                     |

---

### 二、详细区别分析

#### 1. **定义与访问方式**

- **静态成员**：  
  通过 `static` 声明，直接绑定到类（构造函数）上。

  ```javascript
  class MathUtils {
    static add(a, b) {
      return a + b
    } // 静态方法
    static PI = 3.14 // 静态字段
  }
  console.log(MathUtils.add(2, 3)) // 5（通过类名调用）
  console.log(MathUtils.PI) // 3.14
  ```

  实例无法访问静态成员：

  ```javascript
  const util = new MathUtils()
  util.add(2, 3) // TypeError: util.add is not a function
  ```

- **实例成员**：  
  未使用 `static` 的成员属于实例，需通过 `new` 创建对象后访问。
  ```javascript
  class Person {
    constructor(name) {
      this.name = name
    }
    sayHi() {
      console.log(`Hello, ${this.name}!`)
    } // 实例方法
  }
  const alice = new Person('Alice')
  alice.sayHi() // "Hello, Alice!"（通过实例调用）
  ```

#### 2. **`this` 关键字的指向**

- **静态成员**：  
  `this` 指向类本身（构造函数），**而非实例**。

  ```javascript
  class Logger {
    static log() {
      console.log(this === Logger)
    }
  }
  Logger.log() // true
  ```

- **实例成员**：  
  `this` 指向当前实例，可访问实例属性：
  ```javascript
  class Counter {
    count = 0
    increment() {
      this.count++
    } // this 指向实例
  }
  ```

#### 3. **内存管理与生命周期**

- **静态成员**：  
  在类加载时初始化，**全局唯一**，适合共享数据（如缓存、配置）。

  ```javascript
  class Cache {
    static data = {}
    static set(key, value) {
      this.data[key] = value
    }
  }
  Cache.set('user', 'Alice')
  // 所有实例共享同一 Cache.data 对象
  ```

- **实例成员**：  
  每创建一个实例，成员都会**独立分配内存**：
  ```javascript
  class Car {
    color = 'red' // 每个实例有自己的 color
  }
  const car1 = new Car()
  const car2 = new Car()
  car1.color = 'blue' // 不影响 car2
  ```

#### 4. **继承行为**

- **静态成员**：  
  子类可继承父类的公共静态成员，但**私有静态成员（`#field`）仅定义类可访问**：

  ```javascript
  class Shape {
    static #color = 'blue'
    static getColor() {
      return this.#color
    } // 仅 Shape 可调用
  }
  class Circle extends Shape {}
  Circle.getColor() // TypeError: 私有静态字段 #color 未在 Circle 中声明
  ```

- **实例成员**：  
  通过原型链继承，子类实例可调用父类实例方法：
  ```javascript
  class Animal {
    speak() {
      console.log('Sound')
    }
  }
  class Dog extends Animal {}
  new Dog().speak() // "Sound"
  ```

#### 5. **使用场景对比**

| **场景**         | **静态成员**                       | **实例成员**                      |
| ---------------- | ---------------------------------- | --------------------------------- |
| **工具函数**     | 数学计算（`MathUtils.add()`）      | -                                 |
| **工厂模式**     | 创建实例（`User.create()`）        | -                                 |
| **单例模式**     | 全局唯一实例（`DB.getInstance()`） | -                                 |
| **状态管理**     | 类级别状态（如计数器 `Count.c`）   | 实例状态（如 `this.count`）       |
| **操作实例数据** | -                                  | 修改实例属性（`this.name = ...`） |

---

### 三、关键注意事项

1. **静态成员中访问实例属性**  
   静态方法**不能直接访问实例属性**（因无 `this` 指向实例）。需通过参数传递数据：

   ```javascript
   class Validator {
     static isAdult(person) {
       // 静态方法通过参数获取数据
       return person.age >= 18
     }
   }
   ```

2. **实例方法中访问静态成员**  
   需通过**类名**或 **`constructor` 属性**：

   ```javascript
   class Logger {
     static logLevel = 'INFO'
     log(message) {
       console.log(`${this.constructor.logLevel}: ${message}`)
     }
   }
   ```

3. **私有静态成员的限制**  
   私有静态字段（如 `static #cache`）**仅能在定义类内部访问**，子类或外部均不可见 。

4. **避免滥用静态成员**  
   过度使用静态成员会导致代码耦合度高、难以测试（如依赖全局状态）。建议仅在无状态工具类或工厂模式中使用 。

---

### 四、总结

- **使用 `static`**：  
  定义类级别的工具函数、共享数据或工厂方法，无需实例化即可调用。
- **不使用 `static`**：  
  定义与实例状态相关的行为或数据，每个实例拥有独立副本。

合理选择二者能提升代码可读性与内存效率。例如工具类 `MathUtils` 适合静态方法，而需维护独立状态的 `User` 类应使用实例方法。
