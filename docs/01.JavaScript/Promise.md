# Promise

## 1. 基本概念

### 1.1 含义

Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。它由社区最早提出和实现，ES6 将其写进了语言标准，统一了用法，原生提供了Promise对象。

所谓Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

Promise 对象有以下两个特点。

（1）对象的状态不受外界影响。Promise 对象代表一个异步操作，有三种状态：Pending（进行中）、Resolved（已完成，又称 Fulfilled）和 Rejected（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是 Promise 这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法改变。

（2）一旦状态改变，就不会再变，任何时候都可以得到这个结果。Promise 对象的状态改变，只有两种可能：从 Pending 变为 Resolved 和从 Pending 变为 Rejected。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。如果改变已经发生了，你再对 Promise 对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

有了 Promise 对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，Promise 对象提供统一的接口，使得控制异步操作更加容易。

Promise 也有一些缺点。首先，无法取消 Promise，一旦新建它就会立即执行，无法中途取消。其次，如果不设置回调函数，Promise 内部抛出的错误，不会反应到外部。第三，当处于 Pending 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

如果某些事件不断地反复发生，一般来说，使用 Stream 模式是比部署 Promise 更好的选择。因为 Promise 只能解决一个事件，Stream 能够解决多个事件。

### 1.2 用法

ES6 规定，Promise对象是一个构造函数，用来生成Promise实例。

```javascript
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
```

Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是resolve和reject。它们是两个函数，由 JavaScript 引擎提供，不用自己部署。 




## promise 的then的第二个参数 和 catch 有什么区别

promise 的 .then() 和 .catch() 方法有一些关键区别:

1. .then() 方法的第二个参数和 .catch() 方法相似,都用于处理 promise 被拒绝(rejected)的情况。

```js
promise
  .then(
    (value) => {
      // 处理 fulfilled
    },
    (error) => {
      // 处理 rejected
    }
  )
  .catch((error) => {
    // 也是处理 rejected
  });

```

2. .catch() 方法用于捕获 Promise 链中抛出的错误,而 .then() 的第二个参数只能捕获当前 .then() 中 return 的 Promise 被拒绝的情况。

```js
promise
  .then((value) => {
    throw new Error('error!');
  })
  .then(
    (value) => {}, 
    (error) => {
      // 无法捕获到上一个 then 抛出的错误
    }
  )
  .catch((error) => {
    // 可以捕获到错误
  });
```

建议把 .catch() 方法单独使用,不要和 .then() 的第二个参数混合使用,因为会增加代码复杂性,并可能产生一些难以发现的问题。

所以简单来说,.then() 的第二个参数仅处理当前 promise 被拒绝的情况,而 .catch() 可以捕获整个 Promise 链中抛出的错误。












## 手写一个Promise

```js
//起步构建
// 1.用类创建Promise，类中需要有个执行器executor
// 2.执行者中发生错误，交给异常状态处理
// 3.执行者中状态只能触发一次，状态触发一次之后，不能修改状态
// 4.执行者中的this，由调用执行者的作用域决定，因此我们需要将执行者中的this绑定为我们创建的Promise对象。
// 5.在构造函数中需要为Promise对象创建status和value记录Promise的状态和传值。

class MyPromise {
    static PENDING = 'pending'
    static FULFILLED = 'fulfilled'
    static REJECTED = 'rejected'

    constructor(executor) {
        this.status = MyPromise.PENDING;
        this.value = null;
        this.callbacks = [];
        try {
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch (error) {
            this.reject(error)
        }
    }

    resolve(value) {
        if (this.status == MyPromise.PENDING) {
            this.status = MyPromise.FULFILLED;
            this.value = value
            setTimeout(() => {
                this.callbacks.map(item => {
                    item.onFulfilled(this.value);
                })
            })

        }
    }

    reject(reason) {
        if (this.status == MyPromise.PENDING) {
            this.status = MyPromise.REJECTED;
            this.value = reason
            setTimeout(() => {
                this.callbacks.map(item => {
                    item.onRejected(this.value);
                })
            })

        }
    }

    //开始写then方法
    //1.then接收2个参数，一个成功回调函数，一个失败回调函数
    //2.then中发生错误，状态为rejected，交给下一个then处理
    //3.then返回的也是一个Promise
    //4.then的参数值可以为空，可以进行传值穿透
    //5.then中的方法是异步执行的
    //6.then需要等promise的状态改变后，才执行，并且异步执行
    //7.then是可以链式操作的
    //8.then的onFulfilled可以用来返回Promise对象，并且then的状态将以这个Promise为准
    //9.then的默认状态是成功的，上一个Promise对象的状态不会影响下一个then的状态
    //10.then返回的promise对象不是then相同的promise
    then(onFulfilled, onRejected) {
        if (typeof onFulfilled != 'function') {
            onFulfilled = value => value
        }

        if (typeof onRejected != 'function') {
            onRejected = reason => reason
        }

        let promise = new MyPromise((resolve, reject) => {
            if (this.status == MyPromise.FULFILLED) {
                setTimeout(() => {
                    this.parse(promise, onFulfilled(this.value), resolve, reject)
                });

            }

            if (this.status == MyPromise.REJECTED) {
                setTimeout(() => {
                    this.parse(promise, onRejected(this.value), resolve, reject)
                })

            }

            if (this.status == MyPromise.PENDING) {
                this.callbacks.push({
                    onFulfilled: value => {
                        this.parse(promise, onFulfilled(value), resolve, reject)
                    },
                    onRejected: reason => {
                        this.parse(promise, onRejected(reason), resolve, reject)
                    }
                });

            }
        })
        return promise
    }

    //整理冗余代码
    parse(promise, result, resolve, reject) {
        if (promise == result) {
            throw new TypeError('Chaining cycle detected for promise')
        }
        try {
            if (result instanceof MyPromise) {
                result.then(resolve, reject)
            } else {
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
    }

    //Promise的静态方法，resolve
    static resolve(value) {
        return new MyPromise((resolve, reject) => {
            if (value instanceof MyPromise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }

    //Promise的静态方法，reject
    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason)
        })
    }

    //Promise的静态方法，all
    static all(promises) {
        let values = [];
        return new MyPromise((resolve, reject) => {
            promises.forEach(promise => {
                if (promise.status == MyPromise.FULFILLED) {
                    values.push(promise.value)
                } else if (promise.status == MyPromise.REJECTED) {
                    reject(promise.value)
                }
                if (values.length == promises.length) {
                    resolve(values)
                }
            });
        })
    }

    //Promise的静态方法，race
    static race(promises) {
        return new MyPromise((resolve, reject) => {
            promises.forEach(promise => {
                promise.then(value => {
                    resolve(value)
                })
            });
        })
    }

    //Promise的静态方法，race
    catch (onRejected) {
        return this.then(null, onRejected)
    }
}
```