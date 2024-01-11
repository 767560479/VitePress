<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2024-01-11 21:38:28
 * @FilePath: \VitePress\docs\08.React\React.md
 * @LastEditors: zhengfei.tan
 * @LastEditTime: 2024-01-11 21:54:15
-->

# 07.React

## 1.React 绑定*this*,常见解决办法

1. 在render方法种使用箭头函数
   在 React 中，使用箭头函数来绑定 this 是常见做法。这是因为箭头函数会自动将 this 绑定到定义时的上下文。这样可以避免手动绑定*this*的问题。
   例如：

```js
class App extends React.Component {
  handleClick() {
    console.log('this > ', this)
  }
  render() {
    return <div onClick={() => this.handleClick()}>test</div>
  }
}
```

2. bind
   你也可以使用 bind 方法来手动绑定*this*。通过在函数定义时调用 bind 方法，可以将函数中的 this 绑定到指定的上下文。

```js
class App extends React.Component {
  handleClick() {
    console.log('this > ', this)
  }
  render() {
    return <div onClick={this.handleClick.bind(this)}>test</div>
  }
}
```

3. 构造函数
   你可以在构造函数中手动绑定*this*。通过在构造函数中使用 bind 方法，可以将函数中的 this 绑定到指定的上下文。

```js
class App extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick() {
    console.log('this > ', this)
  }
  render() {
    return <div onClick={this.handleClick}>test</div>
  }
}
```

4. 在定义阶段使用箭头函数绑定*this*

```js
class App extends React.Component {
  handleClick = () =>{
    console.log('this > ', this)
  }
  render() {
    return <div onClick={this.handleClick}>test</div>
  }
}
```

## 2.React 生命周期

React 生命周期是指 React 组件从创建到销毁的过程。在 React 16 版本中，引入了新的生命周期方法，以简化组件的生命周期管理。这些新的生命周期方法包括 getDerivedStateFromProps、getSnapshotBeforeUpdate 和 componentDidCatch。

## 3.React 中的高阶组件

高阶组件（HOC）是 React 中的一种高级组件设计模式，它是一种用于组件复用的函数。高阶组件接收一个组件作为参数，并返回一个新的组件。高阶组件可以用于封装通用逻辑、状态管理、组件组合等。

## 4.React 中的受控组件

受控组件是指由 React 状态管理的组件。在受控组件中，表单元素的值由 React 状态管理，而不是直接操作 DOM。这样可以确保表单数据的一致性和可靠性。

## 5.React 中的非受控组件

非受控组件是指由 DOM 直接操作的组件。在非受控组件中，表单元素的值由 DOM 直接管理，而不是由 React 状态管理。这样可以提高性能和灵活性，但同时也需要手动处理表单数据的一致性和可靠性。

## 6.React 中的受控表单

受控表单是指由 React 状态管理的表单。在受控表单中，表单元素的值由 React 状态管理，而不是直接操作 DOM。这样可以确保表单数据的一致性和可靠性。

## 7.React 中的非受控表单

非受控表单是指由 DOM 直接操作的表单。在非受控表单中，表单元素的值由 DOM 直接管理，而不是由 React 状态管理。这样可以提高性能和灵活性，但同时也需要手动处理表单数据的一致性和可靠性。

## 8.React 中的 refs

refs 是 React 中用于访问 DOM 元素或组件实例的属性。通过在组件中定义 ref 属性，可以将 refs 绑定到组件实例或 DOM 元素上。在组件挂载后
，可以通过 refs 访问相应的 DOM 元素或组件实例。

## 9.React 中的事件处理

React 中的事件处理与 DOM 中的事件处理类似。通过在组件中定义事件处理函数，并在事件发生时调用该函数，可以实现事件处理。在事件处理函数中，可以通过 event 对象访问事件的相关信息，例如事件类型、目标元素等。

##
