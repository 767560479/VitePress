import { defineConfig } from 'vitepress'
import AutoIndex from "vite-plugin-vitepress-auto-index"
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar';

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
      { text: 'JavaScript', link: '/01.JavaScript/01.JavaScript' },
      { text: 'NodeJs', link: '/02.NodeJs/index' },
      { text: 'Python', link: '/03.Python/' },
      { text: 'Git', link: '/04.Git/index' },
      { text: 'Vue', link: '/05.Vue/05.Vue' },
    ],

    socialLinks: [//右上角图标和链接，icon 可用svg 配置
      { icon: 'github', link: 'https://gitee.com/gxtzf' }
    ]
  },
  vite: {
    plugins: [
      AutoSidebar({ignoreList: ['public'], createIndex: true}),
      {
      ...AutoIndex({}),
      enforce: 'pre',
    }
  ]
  }
})
