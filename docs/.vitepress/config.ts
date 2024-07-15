import { defineConfig } from 'vitepress'
import AutoIndex from 'vite-plugin-vitepress-auto-index'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'




// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '写bug的F blog',
  description: 'A VitePress Site',
  lastUpdated: true,
  markdown: {
    lineNumbers: true, //md 加行号
  },
  themeConfig: {
    aside: true,
    // outline设置为deep可以解析2-6层深度的标题嵌套
    outline: 'deep',
    outlineBadges: true,
    lastUpdatedText: '更新时间',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      //右侧头部导航
      { text: '主页', link: '/' },
      { text: 'JavaScript', link: '/01.JavaScript/index' },
      { text: 'NodeJs', link: '/02.NodeJs/index' },
      { text: 'Python', link: '/03.Python/index' },
      { text: 'Git', link: '/04.Git/index' },
      { text: 'Vue', link: '/05.Vue/index' },
      { text: 'CSS', link: '/06.CSS/index' },
      { text: 'Angular', link: '/07.Angular/index' },
      { text: 'React', link: '/08.React/index' },
      { text: '笔记', link: '/note/index' },
    ],

    socialLinks: [
      //右上角图标和链接，icon 可用svg 配置
      { icon: 'github', link: 'https://gitee.com/gxtzf' },
      { icon: 'linkedin', link: 'https://www.notion.so/tanzf/' },
    ],
  },
  vite: {
    plugins: [
      AutoSidebar({ ignoreList: ['public'], createIndex: true }),
      {
        ...AutoIndex({}),
        enforce: 'pre',
      },
      pagefindPlugin()
    ],
  },
})
