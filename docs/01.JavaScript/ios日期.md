# 没有日的日期在 iOS 中报 Invalid Date 的探究-蚊子-前端博客

> ## Excerpt
>
> 没有“日”的日期，在 iOS 中，使用 new Date() 会转换失败

---

发布于 2024-03-27 10:21

没有“日”的日期，在 iOS 中，使用 new Date() 会转换失败

开发过一段时间 h5 的同学，都应该知道，在 iOS 中，要将横岗`-`改为`/`的操作。但现在遇到了另一个问题，像 `2024/03` 这种没有“日”的日期，在 iOS 中，使用 new Date('2024/03') 会转换失败。

我们用几种日期格式来验证下：

```javascript
const list = ['2024-02-03', '2024/02/13', '2024-02', '2024/03']
list.forEach(str => {
  const date = new Date(str)
  console.log(str)
  console.log('date', date)
  console.log('getMonth', date.getMonth())
  console.log('toLocalString', date.toLocaleString())
  console.log('dayjs', dayjs(str).format('YYYY-MM-DD HH:mm:ss'))
  console.log('\n')
})
```

看下在 iOS17.3.1 的 safari 浏览器中得到的结果：

![-蚊子的前端博客](https://www.xiabingbao.com/upload/2674660375203ca4d.jpg) ![-蚊子的前端博客](https://www.xiabingbao.com/upload/8854660375232aa50.jpg)

上面的四种日期格式，最后一种使用`new Date()`会转换失败。最终确实证实了我的想法。大家在使用时尤其要注意这一点。

上面的样例中，我们也发现了，使用 `dayjs()` 能转换成功。是因为它并不是把参数直接传入 `Date()` 中，而是把参数解析出年月日时分秒之后，再初始化的。

[https://github.com/iamkun/dayjs/blob/2076da970047c6e0a22c8d4243a42d52833a5df2/src/index.js#L63](https://github.com/iamkun/dayjs/blob/2076da970047c6e0a22c8d4243a42d52833a5df2/src/index.js#L63 'https://github.com/iamkun/dayjs/blob/2076da970047c6e0a22c8d4243a42d52833a5df2/src/index.js#L63')

```javascript
const parseDate = cfg => {
  const { date, utc } = cfg
  if (date === null) return new Date(NaN) // null is invalid
  if (Utils.u(date)) return new Date() // today
  if (date instanceof Date) return new Date(date)

  // 如果传入的参数字符串，则通过正则，将年月日时分秒等都解析出来
  if (typeof date === 'string' && !/Z$/i.test(date)) {
    const d = date.match(C.REGEX_PARSE)
    if (d) {
      const m = d[2] - 1 || 0
      const ms = (d[7] || '0').substring(0, 3)
      if (utc) {
        return new Date(Date.UTC(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms))
      }
      return new Date(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms)
    }
  }

  return new Date(date) // everything else
}
```

在 dayjs 中，如果传入的参数字符串，则通过正则表达式，将年月日时分秒等都解析出来。同时也能看到`d[3]`（年月日中的日）在没有值时，会给个默认值。
