import { defineConfig } from 'vitepress'
import AutoIndex from './vitepress-plugin-auto-index/index'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'
// 导入生成配置工具方法 //
import { getThemeConfig } from '@sugarat/theme/node'
// 主题独有配置，所有配置项，详见文档: https://theme.sugarat.top/ //
const blogTheme = getThemeConfig({
  author: 'tzf',
  homeTags: true,
  hotArticle: {
    title: '🔥 精选文章',
    nextText: '换一组',
    pageSize: 12,
    empty: '暂无精选内容',
  },
  friend: {
    list: [
      {
        nickname: '前端双越老师',
        des: '本名王福朋。前百度、滴滴 前端工程师',
        avatar:
          'https://p6-passport.byteacctimg.com/img/user-avatar/ed902d900835e2e7e3fdfa57fdeb309b~90x90.awebp',
        url: 'https://juejin.cn/user/1714893868765373',
      },
      {
        nickname: '李年糕',
        des: '佛系的打工人',
        avatar: 'https://cdn.upyun.sugarat.top/mdImg/sugar/617be739258b761b7dfed4fa0869326c',
        url: 'https://rimochiko.github.io/',
      },
      {
        nickname: '冴羽',
        des: '冴羽的博客',
        avatar: 'https://cdn.upyun.sugarat.top/avatar/blog/mqyqingfeng.png',
        url: 'https://yayujs.com/',
      },
      {
        nickname: '张成威的网络日志',
        des: '知不足而奋进，望远山而前行',
        avatar: 'https://cdn.upyun.sugarat.top/avatar/blog/zhangchengwei.png',
        url: 'https://www.zhangchengwei.work',
      },
      {
        url: 'https://leelaa.cn',
        avatar: 'https://cdn.upyun.sugarat.top/avatar/blog/leelaa.png',
        des: '肯了个德的博客',
        nickname: 'LEEDAISEN',
      },
      {
        nickname: '博友圈',
        des: '独立博客人的专属朋友圈！',
        avatar: 'https://cdn.upyun.sugarat.top/mdImg/sugar/bdee5d11a1e036ca3634943d34469f59',
        url: 'https://www.boyouquan.com/home',
      },
      {
        nickname: 'Simon He',
        des: '除了coding，我什么都不会',
        avatar: 'https://cdn.upyun.sugarat.top/avatar/blog/simonme.png',
        url: 'https://simonme.netlify.app/',
      },
      {
        nickname: 'laiky',
        des: '一名全栈开发工程师，.NET全栈经验',
        avatar: 'https://cdn.upyun.sugarat.top/avatar/blog/llxz.png',
        url: 'http://llxz.top/',
      },
      {
        nickname: '粥里有勺糖',
        des: '粥里有勺糖',
        avatar: 'https://cdn.upyun.sugarat.top/avatar/blog/zlyst-avatar.jpeg',
        url: 'https://sugarat.top/',
      },
      {
        nickname: 'Hacxy Blog',
        des: '指尖改变命运😋',
        avatar: 'https://hacxy.cn/logo.png',
        url: 'https://hacxy.cn',
      },
    ].map(v => {
      if (v.avatar.includes('//cdn.upyun.sugarat.top')) {
        v.avatar = `${v.avatar}-wh50`
      }
      return v
    }),
    random: true,
    limit: 6,
  },
  search: {
    showDate: true,
    pageResultCount: 4,
  },
  recommend: {
    showSelf: true,
    nextText: '下一页',
    style: 'sidebar',
  },
})

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // 继承博客主题配置 //
  extends: blogTheme, // 插件 //
  base: '/',
  title: '记录bug blog',
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
    lastUpdatedText: '上次更新于',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      //右侧头部导航
      { text: '主页', link: '/' },
      { text: 'JavaScript', link: '/01.JavaScript/index' },
      { text: 'Vue', link: '/05.Vue/index' },
      { text: 'C#', link: '/C#/index' },
      {
        text: 'Java', link: '/Java/index',
      },
      {
        text: '源码学习',
        items: [
          { text: 'Vue3', link: '/Vue3Source/index' },
          { text: 'VueUse', link: '/VueuseSource/index' },
        ],
      },
      {
        text: '前端技术笔记',
        items: [
          { text: 'NodeJs', link: '/02.NodeJs/index' },
          { text: 'CSS', link: '/06.CSS/index' },
          { text: 'Angular', link: '/07.Angular/index' },
          { text: 'React', link: '/08.React/index' },
          { text: 'Python', link: '/03.Python/index' },
          { text: 'Git', link: '/04.Git/index' },
          { text: '算法分析', link: '/leetcode/index' },
          { text: '计算机', link: '/computer/index'},
          { text: 'SQL', link: '/SQL/index' },
        ],
      },
      { text: '笔记', link: '/note/index' },
    ],

    socialLinks: [
      //右上角图标和链接，icon 可用svg 配置
      { icon: 'github', link: 'https://github.com/767560479' },
      // { icon: 'linkedin', link: 'https://www.notion.so/tanzf/' },
    ],
  },
  vite: {
    plugins: [
      // AutoSidebar({ ignoreList: ['public'], createIndex: true }),
      {
        ...AutoIndex({}),
        enforce: 'pre',
      },
      pagefindPlugin(),
    ],
  },
})
