// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import Theme from 'vitepress/theme'
import './style.css'
import BlogTheme from '@sugarat/theme'
export default BlogTheme
// export default {
//   extends: Theme,
//   Layout: () => {
//     return h(Theme.Layout, null, {
//       // https://vitepress.dev/guide/extending-default-theme#layout-slots
//     })
//   },
//   enhanceApp({ app, router, siteData }) {
//     // ...
//   }
// }
