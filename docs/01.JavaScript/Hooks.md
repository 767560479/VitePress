<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2024-04-26 18:25:36
 * @FilePath: \VitePress\docs\01.JavaScript\Hooks.md
-->

## 取消无限 debugger

```js
// ==UserScript==
// @name         代码中禁用无限Debugger
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  禁用无限Debugger
// @author       Cha111Ng1
// @match        http*://*/*
// @icon
// @grant        none
// @run-at       document-start
// ==/UserScript==

;(function () {
  // 破解无限Debugger
  var constructorHook = constructor
  Function.prototype.constructor = function (s) {
    if (s == 'debugger') {
      return function () {}
    }
    return constructorHook(s)
  }
  const setInterval = window.setInterval
  window.setInterval = function (fun, time) {
    // console.log(time, 'ddddd', fun.toString());
    if (fun && fun.toString) {
      var funString = fun.toString()
      if (funString.indexOf('debugger') > -1) return
      if (funString.indexOf('window.close') > -1) return
    }

    return setInterval(fun, time)
  }
})()
```

## 监听 键盘 与 鼠标 事件

```js
// 判断是否按下F12  onkeydown事件
/*
提示： 与 onkeydown 事件相关联的事件触发次序:
onkeydown
onkeypress
onkeyup
*/

// F12的键码为 123，可以直接全局搜索 keyCode == 123, == 123 ,keyCode
document.onkeydown = function () {
  if (window.event && window.event.keyCode == 123) {
    // 改变键码
    event.keyCode = 0
    event.returnValue = false
    // 监听到F12被按下直接关闭窗口
    window.close()
    window.location = 'about:blank'
  }
}
// 监听鼠标右键是否被按下方法 1， oncontextmenu事件
document.oncontextmenu = function () {
  return false
}

// 监听鼠标右键是否被按下方法 2，onmousedown事件
document.onmousedown = function (evt) {
  // button属性是2 就代表是鼠标右键
  if (evt.button == 2) {
    alert('监听到鼠标右键被按下')
    evt.preventDefault() // 该方法将通知 Web 浏览器不要执行与事件关联的默认动作
    return false
  }
}

// 监听用户工具栏调起开发者工具，判断浏览器的可视高度和宽度是否有改变，有改变则处理，
// 判断是否开了开发者工具不太合理。
var h = window.innerHeight,
  w = window.innerWidth
window.onresize = (function () {
  alert('改变了窗口高度')
})(
  // hook代码
  function () {
    //严谨模式 检查所有错误
    'use strict'
    // hook 鼠标选择
    Object.defineProperty(document, 'onselectstart', {
      set: function (val) {
        console.log('Hook捕获到选中设置->', val)
        return val
      },
    })
    // hook 鼠标右键
    Object.defineProperty(document, 'oncontextmenu', {
      set: function (evt) {
        console.log('检测到右键点击')
        return evt
      },
    })
  }
)()
```

## AOP

```js
function Hooks() {
  return {
    initEnv: function () {
      Function.prototype.hook = function (realFunc, hookFunc, context) {
        var _context = null //函数上下文
        var _funcName = null //函数名

        _context = context || window
        _funcName = getFuncName(this)
        _context['realFunc_' + _funcName] = this

        console.log(window)

        if (_context[_funcName].prototype && _context[_funcName].prototype.isHooked) {
          console.log('Already has been hooked,unhook first')
          return false
        }
        function getFuncName(fn) {
          // 获取函数名
          var strFunc = fn.toString()
          var _regex = /function\s+(\w+)\s*\(/
          var patten = strFunc.match(_regex)
          if (patten) {
            return patten[1]
          }
          return ''
        }
        try {
          eval(
            '_context[_funcName] = function ' +
              _funcName +
              '(){\n' +
              'var args = Array.prototype.slice.call(arguments,0);\n' +
              'var obj = this;\n' +
              'hookFunc.apply(obj,args);\n' +
              "return _context['realFunc_" +
              _funcName +
              "'].apply(obj,args);\n" +
              '};'
          )
          _context[_funcName].prototype.isHooked = true
          return true
        } catch (e) {
          console.log('Hook failed,check the params.')
          return false
        }
      }
      Function.prototype.unhook = function (realFunc, funcName, context) {
        var _context = null
        var _funcName = null
        _context = context || window
        _funcName = funcName
        if (!_context[_funcName].prototype.isHooked) {
          console.log('No function is hooked on')
          return false
        }
        _context[_funcName] = _context['realFunc' + _funcName]
        delete _context['realFunc_' + _funcName]
        return true
      }
    },
    cleanEnv: function () {
      if (Function.prototype.hasOwnProperty('hook')) {
        delete Function.prototype.hook
      }
      if (Function.prototype.hasOwnProperty('unhook')) {
        delete Function.prototype.unhook
      }
      return true
    },
  }
}

var hook = Hooks()
hook.initEnv()

// 这个是要执行的正常的函数
function test() {
  alert(arguments[0])
}

// 这个是钩子函数。此钩子函数内心戏：
// 我只喜欢test函数，所以我必须出现在她前面（在她前面执行），这样她才能看到我。
function hookFunc() {
  alert('hookFunc')
}

// hookFunc钩住test
test.hook(test, hookFunc, window)

window.onload = function () {
  // 由于钩子函数hookFunc钩住了test函数，所以test执行时，会先执行hookFunc。
  test('haha')
}
```
