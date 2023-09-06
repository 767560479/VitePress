import { defineConfig } from 'vitepress'
import { getSideBar } from 'vitepress-plugin-autobar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "767560479 blog",
  description: "A VitePress Site",
  markdown: {
    lineNumbers: true//md 加行号
  },
  themeConfig: {
    lastUpdatedText: '更新时间',
    // https://vitepress.dev/reference/default-theme-config
    nav: [ //右侧头部导航
      { text: '主页', link: '/' },
      { text: '例子', link: '/markdown-examples' },

    ],
     sidebar: getSideBar("./docs", {
      ignoreMDFiles: ['index'],
      ignoreDirectory: ['node_modules'],
    }),//左侧导航

    socialLinks: [//右上角图标和链接，icon 可用svg 配置
      { icon: 'github', link: 'https://gitee.com/gxtzf' }
    ]
  }
})
