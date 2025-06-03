---
top: 1
sticky: 1000
sidebar:
  title: 使用GitHubActions实现全自动签到任务
  isTimeLine: true
title: 使用GitHubActions实现全自动签到任务
date: 2025-06-03 22:46:34
tags:
  - 前端
  - javascript
  - nodejs
categories:
  - 前端
---

# 使用 GitHubActions 实现全自动签到任务

## 前言

最近在逛 GitHub 的时候，发现了一个可以签到的小工具，于是想着能不能用 GitHubActions 来实现全自动签到任务呢？经过一番研究，终于实现了这个想法。在现代互联网应用中，每日签到是获取奖励和权益的常见方式。本文将介绍如何利用 GitHub Actions 实现一个全自动签到系统，无需本地环境，24 小时稳定运行。

## 实现思路

1. 首先，我们需要在 GitHub 上创建一个仓库，用于存放签到脚本。
2. 然后，我们需要在仓库中创建一个`.github/workflows`文件夹，并在该文件夹中创建一个`main.yml`文件，用于配置 GitHubActions。在该文件中，我们需要定义一个`workflow`，该`workflow`包含一个或多个`job`，每个`job`包含一个或多个`step`，每个`step`可以执行一个命令或脚本。

### 项目核心架构

#### 1. 配置文件管理 (`Config` 类)

```javascript
class Config {
  static BASE = {
    hostname: 'api-bj.wenxiaobai.com', // API域名
    timeout: 10000, // 10秒请求超时
    maxRetries: 3, // 失败最大重试次数
    activityDelay: 8000, // 活动间隔8秒
  }

  static TASKS = {
    SIGN_IN: '5f2722e2668b3b6de7c14d495e3cbb51', // 签到任务ID
    ACTIVITIES: [
      // 各类活动任务
      { taskName: '浏览游戏广告', taskId: '49986ea4f9f6420bc6db9e0c58eb8819' },
      { taskName: '浏览商品广告', taskId: 'fdae379cb3b3a19d6b654625f0747801' },
    ],
  }
}
```

#### 2. 核心功能模块

- **HTTP 请求模块**：封装 HTTPS 请求，处理超时和重试逻辑
- **活动执行器**：递归执行任务直到成功或达到最大尝试次数
- **多账号支持**：通过分号分隔多个认证令牌
- **智能重试机制**：失败后自动延时重试

#### 3. 执行流程图

```
开始
  ↓
读取环境变量AUTH_TOKEN
  ↓
分割多个账号token
  ↓
循环执行每个账号 ↓
  ├─▶ 执行签到任务
  ├─▶ 遍历执行所有活动
  └─▶ 记录执行日志
  ↓
完成所有任务
```

---

### GitHub Action 配置解析

```yaml
name: 每日签到
on:
  schedule:
    # UTC时间每天9点运行(北京时间17点)
    - cron: '0 1 * * *'
  workflow_dispatch: # 支持手动触发

jobs:
  checkin:
    runs-on: ubuntu-latest
    env:
      AUTH_TOKEN: ${{ secrets.AUTH_TOKEN }} # 安全存储令牌
    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 执行签到脚本
        run: node index.js # 运行主程序
```

关键配置说明：

1. **定时触发器**：使用 cron 表达式设置每天 UTC 时间 1 点（北京时间 9 点）运行
2. **手动触发**：通过`workflow_dispatch`支持随时手动执行
3. **安全存储**：将敏感令牌存储在仓库 Settings > Secrets 中
4. **环境隔离**：使用 Ubuntu 最新版作为纯净执行环境

---

### 使用指南（3 步快速部署）

#### 步骤 1：创建仓库并添加代码

1. 新建 GitHub 仓库
2. 创建`index.js`文件（粘贴提供的 JS 代码）
3. 创建`.github/workflows/main.yml`文件（粘贴 YAML 配置）

#### 步骤 2：设置安全令牌

1. 获取认证令牌（具体获取方式依赖目标网站）
2. 在仓库设置中进入 Secrets > Actions
3. 添加新机密：
   - Name: `AUTH_TOKEN`
   - Value: `your_token_here`（多账号用分号分隔）

#### 步骤 3：激活 Action

1. 提交代码后进入仓库 Actions 标签页
2. 手动触发第一次运行测试
3. 查看执行日志确认签到成功

---

### 高级功能扩展

1. **邮件通知**：添加 SMTP 配置，任务完成后发送结果邮件

   ```yaml
   - name: 发送邮件
     uses: dawidd6/action-send-mail@v3
     with:
       server_address: smtp.gmail.com
       username: ${{secrets.MAIL_USER}}
   ```

2. **失败自动重试**：在 Action 配置中添加错误处理
   ```yaml
   - name: 执行签到脚本
     continue-on-error: true # 即使失败也继续流程
     run: node index.js
   ```

---

### 常见问题排查

1. **令牌失效错误**：

   - 检查令牌是否过期
   - 确认请求头格式是否符合 API 要求

2. **定时任务未执行**：

   - 检查 GitHub Action 是否被禁用
   - 确认仓库的 Actions 权限已开启
   - 验证 cron 表达式时区（UTC 时间）

3. **网络请求失败**：
   - 增加超时时间到 30 秒
   - 添加代理服务器配置
   ```javascript
   // 在HttpClient中添加
   agent: new https.Agent({
     keepAlive: true,
     rejectUnauthorized: false,
   })
   ```

---

### 技术优势总结

1. **完全免费**：利用 GitHub 提供的免费计算资源
2. **跨平台支持**：Windows/macOS/Linux 全兼容
3. **高可靠性**：自动重试机制确保任务完成
4. **可扩展性**：轻松添加新签到平台
5. **安全保密**：通过 Secrets 保护敏感凭证

### 示例

```javascript
const https = require('https')

// 配置管理
class Config {
  static BASE = {
    hostname: 'api-bj.wenxiaobai.com',
    timeout: 10000, // 请求超时时间：10秒
    maxRetries: 3, // 请求失败最大重试次数
    retryDelay: 1000, // 请求失败重试间隔：1秒
    activityDelay: 8000, // 活动执行间隔：8秒
    maxAttempts: 15, // 活动最大执行次数
  }

  static TASKS = {
    SIGN_IN: '5f2722e2668b3b6de7c14d495e3cbb51',
    ACTIVITIES: [
      {
        taskName: '浏览游戏广告',
        taskId: '49986ea4f9f6420bc6db9e0c58eb8819',
      },
      {
        taskName: '浏览商品广告',
        taskId: 'fdae379cb3b3a19d6b654625f0747801',
      },
      {
        taskName: '浏览视频广告',
        taskId: 'd5bc74ea7d8590d5cff7921e2885edf3',
      },
      {
        taskName: '浏览普通广告',
        taskId: '1a73ab0327754bb83e3ea0edc5aa834a',
      },
      {
        taskName: '隐藏广告',
        taskId: 'f8fc47359795fe39535ead4bca48d175',
      },
    ],
  }
}

// 工具类
class Utils {
  static formatTime() {
    return new Date().toISOString().replace('T', ' ').substr(0, 19)
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static log(message, type = 'info') {
    const time = this.formatTime()
    const prefix = type === 'error' ? '错误' : '信息'
    console[type](`[${time}] ${prefix}: ${message}`)
  }
}

// HTTP请求类
class HttpClient {
  static async request(options) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        let data = ''

        res.on('data', chunk => (data += chunk))

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data || '{}'))
            } catch (error) {
              reject(new Error(`解析响应数据失败：${error.message}`))
            }
          } else {
            reject(new Error(`请求失败，状态码：${res.statusCode}，返回：${data}`))
          }
        })
      })

      req.on('error', error => {
        reject(new Error(`网络请求失败：${error.message}`))
      })

      req.on('timeout', () => {
        req.destroy()
        reject(new Error('请求超时'))
      })

      req.end()
    })
  }

  static createOptions(token, taskId) {
    return {
      hostname: Config.BASE.hostname,
      path: `/rest/api/task/trigger?taskId=${taskId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-yuanshi-authorization': `Bearer ${token}`,
        'x-yuanshi-appname': 'wanyu',
      },
      timeout: Config.BASE.timeout,
    }
  }
}

// 活动执行类
class ActivityExecutor {
  constructor(token) {
    this.token = token
  }

  async executeActivity(taskId, taskName, retryCount = 0) {
    try {
      const options = HttpClient.createOptions(this.token, taskId)
      const result = await HttpClient.request(options)

      if (!result.msg) {
        throw new Error('响应数据格式错误')
      }

      Utils.log(`${taskName || '活动'}执行结果：${result.msg}`)

      if (result.msg === 'SUCCESS') {
        if (retryCount >= Config.BASE.maxAttempts) {
          throw new Error(`已达到最大执行次数 ${Config.BASE.maxAttempts}`)
        }
        await Utils.sleep(Config.BASE.activityDelay)
        return this.executeActivity(taskId, taskName, retryCount + 1)
      }

      if (result.msg.includes('maximum')) {
        return result
      }

      throw new Error(`活动执行失败：${result.msg}`)
    } catch (error) {
      if (retryCount < Config.BASE.maxRetries) {
        Utils.log(`${error.message}，${Config.BASE.retryDelay / 1000}秒后重试...`)
        await Utils.sleep(Config.BASE.retryDelay)
        return this.executeActivity(taskId, taskName, retryCount + 1)
      }
      throw error
    }
  }

  async executeSignIn() {
    const options = HttpClient.createOptions(this.token, Config.TASKS.SIGN_IN)
    const result = await HttpClient.request(options)

    if (result.msg === 'SUCCESS') {
      Utils.log('签到成功！')
      ActivityExecutor.signInFlag = true
    } else if (result.msg.includes('今日已签到')) {
      Utils.log('今日已签到！')
      ActivityExecutor.signInFlag = true
    }

    return result
  }

  async executeAllActivities() {
    for (const activity of Config.TASKS.ACTIVITIES) {
      Utils.log(`开始执行${activity.taskName}活动...`)
      try {
        await this.executeActivity(activity.taskId, activity.taskName)
      } catch (error) {
        Utils.log(error.message, 'error')
      }
    }
  }
}

// 主程序
async function main() {
  try {
    if (!process.env.AUTH_TOKEN) {
      throw new Error('缺少认证令牌，请设置AUTH_TOKEN环境变量')
    }

    const tokens = process.env.AUTH_TOKEN.includes(';')
      ? process.env.AUTH_TOKEN.split(';')
      : [process.env.AUTH_TOKEN]

    Utils.log('开始执行签到任务...')

    for (const token of tokens) {
      Utils.log(`执行token:${token}--开始`, 'info')
      const executor = new ActivityExecutor(token)
      try {
        await executor.executeSignIn()
        await executor.executeAllActivities()
      } catch (error) {
        Utils.log(error.message, 'error')
      }
      Utils.log(`执行token:${token}--结束`, 'info')
    }

    Utils.log('所有任务执行完成！')
  } catch (error) {
    Utils.log(error.message, 'error')
    process.exit(1)
  }
}

main()
```

通过本文介绍的方法，你可以轻松搭建属于自己的自动化签到系统，从此不再错过任何每日奖励！

<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2025-06-03 22:46:34
 * @FilePath: \VitePress\docs\02.NodeJs\使用GitHubActions实现全自动签到任务.md
-->
