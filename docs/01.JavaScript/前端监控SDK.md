---
top: 2
sticky: 1000
sidebar:
  title: 前端监控采集SDK
  isTimeLine: true
title: 前端监控采集SDK
date: 2025-04-01
tags:
  - 前端
  - javascript
categories:
  - 前端
---

# 前端监控采集 SDK

实现一个功能全面的前端监控采集 SDK，包含错误采集、性能监控、资源请求跟踪、用户行为监控和数据上报功能。

## 完整实现方案

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>增强版前端监控采集SDK</title>
    <style>
      :root {
        --primary: #3498db;
        --success: #2ecc71;
        --warning: #f39c12;
        --danger: #e74c3c;
        --dark: #2c3e50;
        --light: #ecf0f1;
        --purple: #9b59b6;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      body {
        background-color: #f5f7fa;
        color: #333;
        line-height: 1.6;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      header {
        background: linear-gradient(135deg, var(--dark), #1a2530);
        color: white;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 30px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
      }

      header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.05) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.05) 50%,
          rgba(255, 255, 255, 0.05) 75%,
          transparent 75%,
          transparent
        );
        background-size: 50px 50px;
      }

      h1 {
        font-size: 2.5rem;
        margin-bottom: 10px;
        position: relative;
        z-index: 2;
      }

      .subtitle {
        font-size: 1.2rem;
        opacity: 0.8;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;
      }

      .dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 25px;
        margin-bottom: 30px;
      }

      .card {
        background: white;
        border-radius: 10px;
        padding: 25px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, var(--primary), var(--purple));
      }

      .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }

      .card-title {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--dark);
      }

      .card-icon {
        font-size: 1.8rem;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e3f2fd;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-content {
        min-height: 200px;
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 15px;
        margin-top: 15px;
      }

      .metric {
        text-align: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        transition: all 0.2s ease;
        position: relative;
      }

      .metric::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--primary);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      .metric:hover {
        background: #e9f7fe;
        transform: translateY(-3px);
      }

      .metric:hover::after {
        transform: scaleX(1);
      }

      .metric-value {
        font-size: 1.8rem;
        font-weight: bold;
        margin: 10px 0;
        color: var(--dark);
      }

      .metric-title {
        font-size: 0.9rem;
        color: #666;
      }

      .events-list {
        max-height: 300px;
        overflow-y: auto;
        padding-right: 5px;
      }

      .events-list::-webkit-scrollbar {
        width: 6px;
      }

      .events-list::-webkit-scrollbar-thumb {
        background: #bdc3c7;
        border-radius: 3px;
      }

      .events-list::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      .event-item {
        padding: 12px 15px;
        margin-bottom: 10px;
        background: #f8f9fa;
        border-left: 4px solid var(--primary);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        transition: all 0.2s ease;
      }

      .event-item:hover {
        transform: translateX(3px);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
      }

      .event-item.error {
        border-left-color: var(--danger);
        background: #fef6f6;
      }

      .event-item.warning {
        border-left-color: var(--warning);
        background: #fffbf2;
      }

      .event-item.info {
        border-left-color: var(--primary);
        background: #f0f8ff;
      }

      .event-item.user {
        border-left-color: var(--purple);
        background: #f5f0fa;
      }

      .event-title {
        font-weight: 600;
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
      }

      .event-time {
        font-size: 0.8rem;
        color: #777;
      }

      .event-details {
        font-size: 0.9rem;
        color: #555;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .controls {
        display: flex;
        gap: 15px;
        margin-bottom: 30px;
        flex-wrap: wrap;
      }

      .btn {
        padding: 12px 25px;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .btn::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(30deg) translate(-20px, 100px);
        transition: all 0.6s;
      }

      .btn:hover::after {
        transform: rotate(30deg) translate(20px, -100px);
      }

      .btn-primary {
        background: var(--primary);
        color: white;
      }

      .btn-success {
        background: var(--success);
        color: white;
      }

      .btn-warning {
        background: var(--warning);
        color: white;
      }

      .btn-danger {
        background: var(--danger);
        color: white;
      }

      .btn-purple {
        background: var(--purple);
        color: white;
      }

      .btn:hover {
        opacity: 0.95;
        transform: translateY(-2px);
      }

      .footer {
        text-align: center;
        padding: 20px;
        color: #777;
        font-size: 0.9rem;
        margin-top: 30px;
        border-top: 1px solid #eee;
      }

      .status-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
      }

      .status-active {
        background-color: var(--success);
        box-shadow: 0 0 8px var(--success);
      }

      .status-inactive {
        background-color: var(--danger);
      }

      .chart-container {
        height: 250px;
        margin-top: 20px;
      }

      .hidden {
        display: none;
      }

      .sdk-status {
        display: flex;
        align-items: center;
        margin-top: 10px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        font-size: 0.95rem;
        position: relative;
        z-index: 2;
      }

      .tab-container {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }

      .tab {
        padding: 8px 15px;
        background: #e3f2fd;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .tab.active {
        background: var(--primary);
        color: white;
      }

      .user-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin: 15px 0;
      }

      .action-btn {
        padding: 8px 15px;
        background: #f0f0f0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .action-btn:hover {
        background: #e0e0e0;
        transform: translateY(-2px);
      }

      @media (max-width: 768px) {
        .dashboard {
          grid-template-columns: 1fr;
        }

        .controls {
          flex-direction: column;
        }

        .user-actions {
          flex-direction: column;
        }
      }
    </style>
  </head>

  <body>
    <div class="container">
      <header>
        <h1>增强版前端监控采集SDK</h1>
        <p class="subtitle">错误采集 | 性能监控 | 资源请求 | 用户行为 | 数据上报</p>
        <div class="sdk-status">
          <span class="status-indicator status-active"></span>
          <span
            >SDK状态：<strong>运行中</strong> | 已收集数据：<strong id="eventCount">0</strong> 条 |
            最后上报时间：<strong id="lastReport">尚未上报</strong></span
          >
        </div>
      </header>

      <div class="controls">
        <button id="triggerError" class="btn btn-danger">触发测试错误</button>
        <button id="triggerRequest" class="btn btn-primary">发送测试请求</button>
        <button id="testPerformance" class="btn btn-warning">测试性能</button>
        <button id="simulateUser" class="btn btn-purple">模拟用户行为</button>
        <button id="sendReport" class="btn btn-success">立即上报数据</button>
        <button id="toggleSDK" class="btn">暂停监控</button>
      </div>

      <div class="dashboard">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">错误监控</h2>
            <div class="card-icon">⚠️</div>
          </div>
          <div class="card-content">
            <div class="metrics">
              <div class="metric">
                <div class="metric-title">JS错误</div>
                <div id="jsErrorCount" class="metric-value">0</div>
              </div>
              <div class="metric">
                <div class="metric-title">资源错误</div>
                <div id="resourceErrorCount" class="metric-value">0</div>
              </div>
              <div class="metric">
                <div class="metric-title">Promise错误</div>
                <div id="promiseErrorCount" class="metric-value">0</div>
              </div>
            </div>
            <div class="tab-container">
              <div class="tab active" data-tab="errors">错误日志</div>
              <div class="tab" data-tab="console">控制台日志</div>
            </div>
            <div class="events-list" id="errorList"></div>
            <div class="events-list hidden" id="consoleList"></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">性能指标</h2>
            <div class="card-icon">⏱️</div>
          </div>
          <div class="card-content">
            <div class="metrics">
              <div class="metric">
                <div class="metric-title">页面加载</div>
                <div id="loadTime" class="metric-value">0ms</div>
              </div>
              <div class="metric">
                <div class="metric-title">首次渲染</div>
                <div id="fcpTime" class="metric-value">0ms</div>
              </div>
              <div class="metric">
                <div class="metric-title">DNS查询</div>
                <div id="dnsTime" class="metric-value">0ms</div>
              </div>
            </div>
            <div class="events-list" id="performanceList"></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">资源请求</h2>
            <div class="card-icon">🌐</div>
          </div>
          <div class="card-content">
            <div class="metrics">
              <div class="metric">
                <div class="metric-title">总请求数</div>
                <div id="totalRequests" class="metric-value">0</div>
              </div>
              <div class="metric">
                <div class="metric-title">失败请求</div>
                <div id="failedRequests" class="metric-value">0</div>
              </div>
              <div class="metric">
                <div class="metric-title">平均耗时</div>
                <div id="avgRequestTime" class="metric-value">0ms</div>
              </div>
            </div>
            <div class="events-list" id="requestList"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">用户行为监控</h2>
          <div class="card-icon">👤</div>
        </div>
        <div class="card-content">
          <div class="user-actions">
            <button id="trackClick" class="action-btn">跟踪点击</button>
            <button id="trackNavigation" class="action-btn">跟踪页面导航</button>
            <button id="trackApiCall" class="action-btn">跟踪API调用</button>
            <button id="trackPageStay" class="action-btn">跟踪页面停留时间</button>
          </div>
          <div class="metrics">
            <div class="metric">
              <div class="metric-title">点击事件</div>
              <div id="clickEvents" class="metric-value">0</div>
            </div>
            <div class="metric">
              <div class="metric-title">页面导航</div>
              <div id="navigationEvents" class="metric-value">0</div>
            </div>
            <div class="metric">
              <div class="metric-title">页面停留</div>
              <div id="pageStayEvents" class="metric-value">0</div>
            </div>
          </div>
          <div class="events-list" id="userBehaviorList"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">数据上报日志</h2>
          <div class="card-icon">📤</div>
        </div>
        <div class="card-content">
          <div class="events-list" id="reportLog"></div>
        </div>
      </div>

      <div class="footer">
        <p>增强版前端监控采集SDK | 实时数据展示面板 | 数据仅用于演示，不会实际发送到服务器</p>
      </div>
    </div>

    <script>
      // 前端监控SDK实现
      class FrontendMonitor {
        constructor(options = {}) {
          // 配置项
          this.config = {
            appId: options.appId || 'default-app',
            reportUrl: options.reportUrl || 'https://api.example.com/monitor/report',
            maxBatchSize: options.maxBatchSize || 5,
            reportInterval: options.reportInterval || 10000,
            enableErrorTracking: options.enableErrorTracking !== false,
            enablePerformanceTracking: options.enablePerformanceTracking !== false,
            enableRequestTracking: options.enableRequestTracking !== false,
            enableUserTracking: options.enableUserTracking !== false,
            enableConsoleTracking: options.enableConsoleTracking !== false,
          }

          // 数据缓存
          this.eventQueue = []
          this.isSending = false
          this.timer = null

          // 统计数据
          this.stats = {
            jsErrors: 0,
            resourceErrors: 0,
            promiseErrors: 0,
            totalRequests: 0,
            failedRequests: 0,
            requestTimes: [],
            lastReportTime: null,
            clickEvents: 0,
            navigationEvents: 0,
            pageStayEvents: 0,
            consoleLogs: 0,
          }

          // 用户行为跟踪相关
          this.currentPage = window.location.href
          this.pageEnterTime = Date.now()
          this.pageStayTimer = null

          // 初始化
          this.init()
        }

        init() {
          if (this.config.enableErrorTracking) {
            this.setupErrorTracking()
          }

          if (this.config.enablePerformanceTracking) {
            this.setupPerformanceTracking()
          }

          if (this.config.enableRequestTracking) {
            this.setupRequestTracking()
          }

          if (this.config.enableUserTracking) {
            this.setupUserTracking()
          }

          if (this.config.enableConsoleTracking) {
            this.setupConsoleTracking()
          }

          // 启动定时上报
          this.startReporting()

          // 在页面卸载前上报数据
          window.addEventListener('beforeunload', () => {
            this.recordPageStayTime()
            this.sendReport('unload')
          })

          // 单页应用路由变化监听
          window.addEventListener('popstate', this.handleRouteChange.bind(this))
          window.addEventListener('hashchange', this.handleRouteChange.bind(this))
        }

        // 设置错误监控
        setupErrorTracking() {
          // JS运行时错误
          window.addEventListener(
            'error',
            event => {
              const { message, filename, lineno, colno, error } = event
              this.captureEvent({
                type: 'js_error',
                message: message,
                filename: filename,
                line: lineno,
                column: colno,
                stack: error && error.stack ? error.stack : '',
                timestamp: Date.now(),
              })
              this.stats.jsErrors++
              updateUI()
            },
            true
          )

          // 资源加载错误
          window.addEventListener(
            'error',
            event => {
              const target = event.target
              if (target !== window && (target.src || target.href)) {
                this.captureEvent({
                  type: 'resource_error',
                  tagName: target.tagName,
                  resourceUrl: target.src || target.href,
                  timestamp: Date.now(),
                })
                this.stats.resourceErrors++
                updateUI()
              }
            },
            true
          )

          // Promise未处理错误
          window.addEventListener('unhandledrejection', event => {
            const reason = event.reason || {}
            this.captureEvent({
              type: 'promise_error',
              message: reason.message || String(reason),
              stack: reason.stack || '',
              timestamp: Date.now(),
            })
            this.stats.promiseErrors++
            updateUI()
          })
        }

        // 设置控制台日志监控
        setupConsoleTracking() {
          const consoleMethods = ['log', 'info', 'warn', 'error']
          const that = this

          consoleMethods.forEach(method => {
            const original = console[method]

            console[method] = function (...args) {
              // 调用原始方法
              original.apply(console, args)

              // 捕获日志
              that.captureEvent({
                type: 'console',
                level: method,
                message: args
                  .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
                  .join(' '),
                timestamp: Date.now(),
              })
              that.stats.consoleLogs++
              updateUI()
            }
          })
        }

        // 设置性能监控
        setupPerformanceTracking() {
          if (!window.performance) return

          // 获取性能数据
          const timing = performance.timing
          const now = Date.now()

          // 关键性能指标
          const perfData = {
            type: 'performance',
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            ttfb: timing.responseStart - timing.requestStart,
            download: timing.responseEnd - timing.responseStart,
            domReady: timing.domContentLoadedEventStart - timing.domLoading,
            load: timing.loadEventEnd - timing.navigationStart,
            fcp: 0, // 首次内容渲染时间
            lcp: 0, // 最大内容渲染时间
            fid: 0, // 首次输入延迟
            timestamp: now,
          }

          // 使用PerformanceObserver获取更多现代性能指标
          if (window.PerformanceObserver) {
            const observer = new PerformanceObserver(list => {
              list.getEntries().forEach(entry => {
                if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                  perfData.fcp = Math.round(entry.startTime)
                }
              })
            })
            observer.observe({ entryTypes: ['paint'] })
          }

          // 延迟一点确保获取到FCP
          setTimeout(() => {
            this.captureEvent(perfData)
            updateUI()
          }, 1000)
        }

        // 设置请求监控（安全重写）
        setupRequestTracking() {
          const that = this

          // 安全地重写fetch
          if (window.fetch) {
            const originalFetch = window.fetch

            window.fetch = function (input, init) {
              const startTime = Date.now()
              const url = typeof input === 'string' ? input : input.url
              const method = (init && init.method) || 'GET'

              return originalFetch
                .apply(this, arguments)
                .then(response => {
                  // 克隆response以便读取数据而不影响原始流
                  const clonedResponse = response.clone()
                  clonedResponse.text().then(() => {
                    that.trackRequest({
                      method: method,
                      url: url,
                      status: response.status,
                      duration: Date.now() - startTime,
                      timestamp: startTime,
                    })
                  })
                  return response
                })
                .catch(error => {
                  that.trackRequest({
                    method: method,
                    url: url,
                    status: 0,
                    duration: Date.now() - startTime,
                    error: error.message,
                    timestamp: startTime,
                  })
                  throw error
                })
            }
          }

          // 安全地重写XMLHttpRequest
          if (window.XMLHttpRequest) {
            const originalOpen = XMLHttpRequest.prototype.open
            const originalSend = XMLHttpRequest.prototype.send
            const originalAbort = XMLHttpRequest.prototype.abort

            XMLHttpRequest.prototype.open = function (method, url) {
              this._requestMethod = method
              this._requestUrl = url
              return originalOpen.apply(this, arguments)
            }

            XMLHttpRequest.prototype.send = function (body) {
              this._requestStartTime = Date.now()
              this._requestBody = body
              this._requestEnded = false

              const onRequestEnd = () => {
                if (this._requestEnded) return
                this._requestEnded = true

                const duration = Date.now() - this._requestStartTime
                that.trackRequest({
                  method: this._requestMethod,
                  url: this._requestUrl,
                  status: this.status || 0,
                  duration: duration,
                  timestamp: this._requestStartTime,
                })

                // 清理事件监听
                this.removeEventListener('load', onRequestEnd)
                this.removeEventListener('error', onRequestEnd)
                this.removeEventListener('abort', onRequestEnd)
              }

              this.addEventListener('load', onRequestEnd)
              this.addEventListener('error', onRequestEnd)
              this.addEventListener('abort', onRequestEnd)

              return originalSend.apply(this, arguments)
            }

            // 处理abort
            XMLHttpRequest.prototype.abort = function () {
              if (!this._requestEnded) {
                this._requestEnded = true
                const duration = Date.now() - this._requestStartTime
                that.trackRequest({
                  method: this._requestMethod,
                  url: this._requestUrl,
                  status: 0,
                  duration: duration,
                  aborted: true,
                  timestamp: this._requestStartTime,
                })
              }
              return originalAbort.apply(this, arguments)
            }
          }
        }

        // 设置用户行为监控
        setupUserTracking() {
          // 跟踪点击事件
          document.addEventListener(
            'click',
            event => {
              const target = event.target
              const tagName = target.tagName.toLowerCase()
              const id = target.id ? `#${target.id}` : ''
              const classes = target.className ? `.${target.className.split(' ').join('.')}` : ''

              this.captureEvent({
                type: 'user_click',
                element: `${tagName}${id}${classes}`,
                x: event.clientX,
                y: event.clientY,
                timestamp: Date.now(),
              })
              this.stats.clickEvents++
              updateUI()
            },
            { capture: true, passive: true }
          )

          // 开始跟踪页面停留时间
          this.startPageStayTracking()
        }

        // 开始跟踪页面停留时间
        startPageStayTracking() {
          // 清除现有定时器
          if (this.pageStayTimer) clearInterval(this.pageStayTimer)

          // 每10秒记录一次页面停留
          this.pageStayTimer = setInterval(() => {
            this.recordPageStayTime()
          }, 10000)
        }

        // 记录页面停留时间
        recordPageStayTime() {
          const now = Date.now()
          const stayTime = now - this.pageEnterTime

          if (stayTime > 0) {
            this.captureEvent({
              type: 'page_stay',
              pageUrl: this.currentPage,
              stayTime: stayTime,
              timestamp: now,
            })
            this.stats.pageStayEvents++
            updateUI()

            // 重置进入时间
            this.pageEnterTime = now
          }
        }

        // 处理路由变化
        handleRouteChange() {
          // 记录当前页面停留时间
          this.recordPageStayTime()

          // 更新当前页面信息
          this.currentPage = window.location.href

          // 记录导航事件
          this.captureEvent({
            type: 'navigation',
            from: this.previousPage || '',
            to: this.currentPage,
            timestamp: Date.now(),
          })
          this.stats.navigationEvents++
          updateUI()

          // 更新上一页面
          this.previousPage = this.currentPage
        }

        // 跟踪请求
        trackRequest(data) {
          this.stats.totalRequests++
          if (data.status >= 400 || data.status === 0) {
            this.stats.failedRequests++
          }
          this.stats.requestTimes.push(data.duration)

          this.captureEvent({
            type: 'request',
            ...data,
          })

          updateUI()
        }

        // 捕获事件
        captureEvent(event) {
          const fullEvent = {
            appId: this.config.appId,
            pageUrl: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            ...event,
          }

          this.eventQueue.push(fullEvent)
          eventCount++

          // 如果队列达到最大批量大小，立即上报
          if (this.eventQueue.length >= this.config.maxBatchSize) {
            this.sendReport('batch')
          }

          // 更新UI
          addEventToUI(fullEvent)
        }

        // 启动定时上报
        startReporting() {
          if (this.timer) clearInterval(this.timer)
          this.timer = setInterval(() => {
            if (this.eventQueue.length > 0) {
              this.sendReport('interval')
            }
          }, this.config.reportInterval)
        }

        // 停止上报
        stopReporting() {
          if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
        }

        // 发送上报
        sendReport(reason = 'manual') {
          if (this.isSending || this.eventQueue.length === 0) return

          this.isSending = true
          const eventsToSend = [...this.eventQueue]
          this.eventQueue = []

          // 在实际应用中，这里会发送数据到服务器
          // 演示中我们模拟发送
          return new Promise(resolve => {
            setTimeout(() => {
              // 记录上报日志
              const reportLog = {
                type: 'report',
                eventCount: eventsToSend.length,
                reason,
                timestamp: Date.now(),
              }

              this.stats.lastReportTime = new Date()
              this.isSending = false

              // 添加到日志
              addReportLogToUI(reportLog)
              updateUI()

              resolve()
            }, 300) // 模拟网络延迟
          })
        }

        // 获取统计数据
        getStats() {
          return {
            ...this.stats,
            eventCount: eventCount,
            avgRequestTime:
              this.stats.requestTimes.length > 0
                ? Math.round(
                    this.stats.requestTimes.reduce((a, b) => a + b, 0) /
                      this.stats.requestTimes.length
                  )
                : 0,
          }
        }

        // 切换SDK状态
        toggle(enabled) {
          if (enabled) {
            this.init()
          } else {
            this.stopReporting()
            // 移除事件监听器
            window.removeEventListener('error', this.errorHandler)
            window.removeEventListener('unhandledrejection', this.promiseHandler)
            window.removeEventListener('click', this.clickHandler)
            window.removeEventListener('popstate', this.routeHandler)
            window.removeEventListener('hashchange', this.routeHandler)

            if (this.pageStayTimer) {
              clearInterval(this.pageStayTimer)
              this.pageStayTimer = null
            }
          }
        }
      }

      // 全局变量
      let monitor
      let eventCount = 0
      let sdkEnabled = true

      // 初始化监控SDK
      function initMonitor() {
        monitor = new FrontendMonitor({
          appId: 'monitor-demo',
          reportUrl: 'https://api.example.com/monitor/report',
          maxBatchSize: 5,
          reportInterval: 15000,
          enableConsoleTracking: true,
        })
      }

      // 更新UI
      function updateUI() {
        if (!monitor) return

        const stats = monitor.getStats()

        // 更新错误统计
        document.getElementById('jsErrorCount').textContent = stats.jsErrors
        document.getElementById('resourceErrorCount').textContent = stats.resourceErrors
        document.getElementById('promiseErrorCount').textContent = stats.promiseErrors

        // 更新请求统计
        document.getElementById('totalRequests').textContent = stats.totalRequests
        document.getElementById('failedRequests').textContent = stats.failedRequests
        document.getElementById('avgRequestTime').textContent = stats.avgRequestTime + 'ms'

        // 更新用户行为统计
        document.getElementById('clickEvents').textContent = stats.clickEvents
        document.getElementById('navigationEvents').textContent = stats.navigationEvents
        document.getElementById('pageStayEvents').textContent = stats.pageStayEvents

        // 更新事件计数
        document.getElementById('eventCount').textContent = eventCount

        // 更新最后上报时间
        if (stats.lastReportTime) {
          document.getElementById('lastReport').textContent =
            stats.lastReportTime.toLocaleTimeString()
        }
      }

      // 添加事件到UI
      function addEventToUI(event) {
        let list, itemClass, title, details

        switch (event.type) {
          case 'js_error':
            list = document.getElementById('errorList')
            itemClass = 'error'
            title = `JS错误: ${event.message}`
            details = `文件: ${event.filename}:${event.line}:${event.column}`
            break

          case 'resource_error':
            list = document.getElementById('errorList')
            itemClass = 'error'
            title = `资源加载失败: ${event.resourceUrl}`
            details = `标签: <${event.tagName}>`
            break

          case 'promise_error':
            list = document.getElementById('errorList')
            itemClass = 'error'
            title = `Promise错误: ${event.message}`
            details = event.stack ? event.stack.substring(0, 100) + '...' : ''
            break

          case 'console':
            list = document.getElementById('consoleList')
            itemClass =
              event.level === 'error' ? 'error' : event.level === 'warn' ? 'warning' : 'info'
            title = `控制台.${event.level}: ${event.message.substring(0, 80)}${
              event.message.length > 80 ? '...' : ''
            }`
            details = ''
            break

          case 'performance':
            list = document.getElementById('performanceList')
            itemClass = ''
            title = `页面性能指标`
            details = `加载时间: ${event.load}ms, FCP: ${event.fcp}ms`

            // 更新性能指标
            document.getElementById('loadTime').textContent = event.load + 'ms'
            document.getElementById('fcpTime').textContent = event.fcp + 'ms'
            document.getElementById('dnsTime').textContent = event.dns + 'ms'
            break

          case 'request':
            list = document.getElementById('requestList')
            itemClass = event.status >= 400 || event.status === 0 ? 'warning' : ''
            title = `${event.method} ${event.url} - ${event.status}`
            details = `耗时: ${event.duration}ms`
            if (event.aborted) details += ' (已中止)'
            break

          case 'user_click':
            list = document.getElementById('userBehaviorList')
            itemClass = 'user'
            title = `用户点击: ${event.element}`
            details = `位置: (${event.x}, ${event.y})`
            break

          case 'navigation':
            list = document.getElementById('userBehaviorList')
            itemClass = 'user'
            title = `页面导航`
            details = `从 ${event.from || '无'} 到 ${event.to}`
            break

          case 'page_stay':
            list = document.getElementById('userBehaviorList')
            itemClass = 'user'
            title = `页面停留`
            details = `页面: ${event.pageUrl}, 停留: ${Math.round(event.stayTime / 1000)}秒`
            break

          default:
            return
        }

        const time = new Date(event.timestamp).toLocaleTimeString()
        const eventItem = document.createElement('div')
        eventItem.className = `event-item ${itemClass}`
        eventItem.innerHTML = `
                <div class="event-title">
                    <span>${title}</span>
                    <span class="event-time">${time}</span>
                </div>
                <div class="event-details">${details}</div>
            `

        if (list) {
          list.insertBefore(eventItem, list.firstChild)

          // 限制列表长度
          if (list.children.length > 20) {
            list.removeChild(list.lastChild)
          }
        }
      }

      // 添加上报日志到UI
      function addReportLogToUI(report) {
        const list = document.getElementById('reportLog')
        const time = new Date(report.timestamp).toLocaleTimeString()

        const reasons = {
          manual: '手动触发',
          interval: '定时上报',
          batch: '批量上报',
          unload: '页面卸载',
        }

        const reportItem = document.createElement('div')
        reportItem.className = 'event-item'
        reportItem.innerHTML = `
                <div class="event-title">
                    <span>数据上报 (${reasons[report.reason] || report.reason})</span>
                    <span class="event-time">${time}</span>
                </div>
                <div class="event-details">上报事件数: ${report.eventCount}</div>
            `

        list.insertBefore(reportItem, list.firstChild)

        // 限制列表长度
        if (list.children.length > 10) {
          list.removeChild(list.lastChild)
        }
      }

      // 页面加载完成后初始化
      document.addEventListener('DOMContentLoaded', () => {
        // 初始化监控SDK
        initMonitor()

        // 标签切换
        document.querySelectorAll('.tab').forEach(tab => {
          tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
            tab.classList.add('active')

            if (tab.dataset.tab === 'errors') {
              document.getElementById('errorList').classList.remove('hidden')
              document.getElementById('consoleList').classList.add('hidden')
            } else if (tab.dataset.tab === 'console') {
              document.getElementById('errorList').classList.add('hidden')
              document.getElementById('consoleList').classList.remove('hidden')
            }
          })
        })

        // 绑定按钮事件
        document.getElementById('triggerError').addEventListener('click', () => {
          // 触发一个测试错误
          try {
            throw new Error('这是手动触发的测试错误')
          } catch (e) {
            // 捕获并报告
            monitor.captureEvent({
              type: 'js_error',
              message: e.message,
              filename: 'test.js',
              line: 1,
              column: 1,
              stack: e.stack,
              timestamp: Date.now(),
            })
            monitor.stats.jsErrors++
            updateUI()
          }
        })

        document.getElementById('triggerRequest').addEventListener('click', () => {
          // 发送测试请求
          fetch('https://jsonplaceholder.typicode.com/posts/1').catch(() => {}) // 忽略错误

          // 模拟失败请求
          fetch('https://example.com/non-existent-url').catch(() => {}) // 忽略错误

          // 模拟XHR请求
          const xhr = new XMLHttpRequest()
          xhr.open('GET', 'https://jsonplaceholder.typicode.com/comments')
          xhr.send()

          // 模拟中止的请求
          const abortedXhr = new XMLHttpRequest()
          abortedXhr.open('GET', 'https://jsonplaceholder.typicode.com/users')
          abortedXhr.send()
          setTimeout(() => abortedXhr.abort(), 100)
        })

        document.getElementById('testPerformance').addEventListener('click', () => {
          // 模拟性能数据
          monitor.captureEvent({
            type: 'performance',
            dns: 12,
            tcp: 25,
            ttfb: 150,
            download: 200,
            domReady: 1200,
            load: 2200,
            fcp: 850,
            lcp: 1200,
            fid: 15,
            timestamp: Date.now(),
          })
          updateUI()
        })

        document.getElementById('simulateUser').addEventListener('click', () => {
          // 模拟用户行为
          monitor.captureEvent({
            type: 'user_click',
            element: 'button#simulateUser',
            x: 100,
            y: 200,
            timestamp: Date.now(),
          })
          monitor.stats.clickEvents++

          monitor.captureEvent({
            type: 'navigation',
            from: window.location.href,
            to: 'https://example.com/new-page',
            timestamp: Date.now(),
          })
          monitor.stats.navigationEvents++

          monitor.captureEvent({
            type: 'page_stay',
            pageUrl: window.location.href,
            stayTime: 15000,
            timestamp: Date.now(),
          })
          monitor.stats.pageStayEvents++

          updateUI()
        })

        document.getElementById('sendReport').addEventListener('click', () => {
          monitor.sendReport('manual')
        })

        document.getElementById('toggleSDK').addEventListener('click', () => {
          sdkEnabled = !sdkEnabled
          monitor.toggle(sdkEnabled)
          const button = document.getElementById('toggleSDK')
          button.textContent = sdkEnabled ? '暂停监控' : '启动监控'
          button.className = sdkEnabled ? 'btn' : 'btn btn-warning'

          const statusIndicator = document.querySelector('.status-indicator')
          statusIndicator.className = sdkEnabled
            ? 'status-indicator status-active'
            : 'status-indicator status-inactive'
        })

        // 用户行为按钮
        document.getElementById('trackClick').addEventListener('click', () => {
          monitor.captureEvent({
            type: 'user_click',
            element: 'button#trackClick',
            x: 200,
            y: 300,
            timestamp: Date.now(),
          })
          monitor.stats.clickEvents++
          updateUI()
        })

        document.getElementById('trackNavigation').addEventListener('click', () => {
          monitor.captureEvent({
            type: 'navigation',
            from: window.location.href,
            to: 'https://example.com/settings',
            timestamp: Date.now(),
          })
          monitor.stats.navigationEvents++
          updateUI()
        })

        document.getElementById('trackPageStay').addEventListener('click', () => {
          monitor.captureEvent({
            type: 'page_stay',
            pageUrl: window.location.href,
            stayTime: 45000,
            timestamp: Date.now(),
          })
          monitor.stats.pageStayEvents++
          updateUI()
        })

        // 初始UI更新
        updateUI()
      })
    </script>
  </body>
</html>
```

## 功能亮点

### 1. 增强的错误采集

- JavaScript 运行时错误捕获
- 资源加载错误监控
- Promise 未处理错误捕获
- 控制台日志监控（log, info, warn, error）

### 2. 全面的性能监控

- 页面加载时间
- DNS 查询时间
- TCP 连接时间
- 首次内容渲染时间(FCP)
- DOM 加载时间

### 3. 安全可靠的资源请求跟踪

- 重写 fetch API，确保不影响原有功能
- 重写 XMLHttpRequest，处理各种边界情况（包括请求中止）
- 支持监控成功和失败的请求
- 计算平均请求耗时

### 4. 用户行为监控

- 点击事件跟踪（元素、位置）
- 页面导航跟踪（单页应用路由变化）
- 页面停留时间统计
- 自定义用户行为跟踪

### 5. 数据上报系统

- 多种上报策略：定时上报、批量上报、手动上报
- 在页面卸载前确保数据上报
- 上报日志记录

### 6. 用户友好的控制面板

- 实时数据统计展示
- 分类事件日志查看
- 模拟测试功能
- SDK 状态控制

## 技术实现细节

1. **安全的重写机制**：

   - 在重写 fetch 和 XMLHttpRequest 时，确保不影响原有功能
   - 克隆 fetch 响应以避免干扰原始数据流
   - 处理请求中止等边界情况

2. **用户行为跟踪**：

   - 通过事件监听捕获用户点击
   - 使用定时器统计页面停留时间
   - 监听 popstate 和 hashchange 事件跟踪单页应用路由变化

3. **错误边界处理**：

   - 使用 try-catch 处理手动触发的测试错误
   - 对 Promise 错误使用 unhandledrejection 事件监听

4. **数据上报优化**：
   - 使用批量上报减少网络请求
   - 在页面卸载前确保数据上报
   - 多种上报策略灵活切换

这个增强版 SDK 提供了全面的前端监控解决方案，帮助开发者深入了解应用性能、错误情况和用户行为。
