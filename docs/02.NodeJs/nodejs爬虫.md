# 使用 puppeteer 和 cheerio 爬取网页内容

### 全屏截图方法

```js
/**
 * 全屏截图
 * @param {*} page
 */
async function screenshot(page) {
  const _start_time = Date.now()
  log(`==全屏截图== Start...`)
  fs.mkdirSync('./img', { recursive: true })
  await page.screenshot({
    path: path.join(__dirname, `./img/img_${Date.now()}.jpeg`), //截图保存路径。截图图片类型将从文件扩展名推断出来。如果是相对路径，则从当前路径解析。如果没有指定路径，图片将不会保存到硬盘。
    type: 'jpeg', //指定截图类型, 可以是 jpeg 或者 png。默认 'png'
    quality: 100, //图片质量, 可选值 0-100. png 类型不适用。
    fullPage: true, //如果设置为true，则对完整的页面（需要滚动的部分也包含在内）。默认是false
  })
  log(`==全屏截图== End... 耗时：${(Date.now() - _start_time) / 1000}秒`)
}
```

### 懒加载数据加载处理

```js

  // 懒加载配置
 var = lazyLoad: {
    distance: 1000, //单次滚动距离（像素）
    frequency: 200, //滚动频率（毫秒）
    retry: 2, //重试校准次数
  },

/**
 * 懒加载数据加载处理
 * 原理：检测两次相邻的滚动是否存在高度差，考虑接口性能影响，可能滚动后数据并未加载出来，增加重试次数校准
 * @param {*} page
 */
async function autoScroll(page) {
  const _start_time = Date.now()
  log(`==懒加载数据加载处理== Start...`)
  await page.evaluate(async lazyLoad => {
    await new Promise(resolve => {
      var totalHeight = 0
      var distance = lazyLoad.distance
      let count = 0
      var timer = setInterval(() => {
        if (count) {
          console.log(`【---懒加载数据校准重试---】第${count}次`)
        }
        var scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance

        if (totalHeight >= scrollHeight) {
          // 重试
          if (count < lazyLoad.retry) {
            ++count
          } else {
            clearInterval(timer)
            resolve()
          }
          // 重置
        } else {
          count = 0
        }
      }, lazyLoad.frequency)
    })
  }, lazyLoad)
  log(`==懒加载数据加载处理== End... 耗时：${(Date.now() - _start_time) / 1000}秒`)
}
```

### ua

```js
exports.ua = {
  'wx-android':
    'mozilla/5.0 (linux; u; android 4.1.2; zh-cn; mi-one plus build/jzo54k) applewebkit/534.30 (khtml, like gecko) version/4.0 mobile safari/534.30 micromessenger/5.0.1.352',
  'wx-ios':
    'mozilla/5.0 (iphone; cpu iphone os 5_1_1 like mac os x) applewebkit/534.46 (khtml, like gecko) mobile/9b206 micromessenger/5.0',
  'jx-app-android':
    'jdpingou;android;2.6.0;10;fb9ae030e2990e56-483fe9774d35;network/wifi;model/ELE-AL00;appBuild/3071;partner/huawei01;;session/7;aid/fb9ae030e2990e56;oaid/feffffef-775d-ca97-ff56-fbb5ddbcd497;Mozilla/5.0 (Linux; Android 10; ELE-AL00 Build/HUAWEIELE-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045016 Mobile Safari/537.36',
  'jx-app-ios':
    'jdpingou;iPhone;2.0.0;13.2.3;2ab0c9dd5b5061bc58e0779a03beea0e7a8f21c8;network/wifi;model/iPhone10,1;appBuild/1000;ADID/2B47CF62-7657-4FE6-82DF-8578FF764F07;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
}
```

### 日期格式化

```js
/**
 * 日期格式化
 * 格式 YYYY/yyyy/YY/yy 表示年份
 * MM/M 月份
 * W/w 星期
 * dd/DD/d/D 日期
 * hh/HH/h/H 时间
 * mm/m 分钟
 * ss/SS/s/S 秒
 */
exports.format = function (date, formatStr) {
  var str = formatStr
  var Week = ['日', '一', '二', '三', '四', '五', '六']

  str = str.replace(/yyyy|YYYY/, date.getFullYear())
  str = str.replace(
    /yy|YY/,
    date.getYear() % 100 > 9 ? (date.getYear() % 100).toString() : '0' + (date.getYear() % 100)
  )

  str = str.replace(/MM/, date.getMonth() > 9 ? date.getMonth().toString() : '0' + date.getMonth())
  str = str.replace(/M/g, date.getMonth())

  str = str.replace(/w|W/g, Week[date.getDay()])

  str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate())
  str = str.replace(/d|D/g, date.getDate())

  str = str.replace(
    /hh|HH/,
    date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours()
  )
  str = str.replace(/h|H/g, date.getHours())
  str = str.replace(
    /mm/,
    date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes()
  )
  str = str.replace(/m/g, date.getMinutes())

  str = str.replace(
    /ss|SS/,
    date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds()
  )
  str = str.replace(/s|S/g, date.getSeconds())

  return str
}
```

### 延迟执行

```js
/**
 * 延迟执行
 * @param time
 */
exports.sleep = function (time) {
  return new Promise(resolve => setTimeout(resolve, time))
}
```

### 文件工具

```js
const fs = require('fs')
const path = require('path')
const request = require('request')

module.exports = {
  writeFile(path, buffer, callback) {
    fs.writeFile(path, buffer, err => {
      if (err) return callback(err)
      return callback(null)
    })
  },
  /**
   * 下载单张图片
   * @param {*} src 网络地址
   * @param {*} dest 本地地址
   * @param {*} callback
   */
  downloadImage(src, dest, callback) {
    if (!fs.existsSync(dest)) {
      mkdirSync(dest)
    }
    request.head(src, (err, res, body) => {
      if (err) {
        console.log(err)
        return
      }
      src &&
        request(src)
          .pipe(fs.createWriteStream(dest))
          .on('close', () => {
            callback && callback(null, dest)
          })
    })
  },
}

//递归创建目录 同步方法
function mkdirSync(dirname) {
  //console.log(dirname);
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}
```
