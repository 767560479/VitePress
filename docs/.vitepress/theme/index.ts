// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import Theme from 'vitepress/theme'
import './style.css'
import BlogTheme from '@sugarat/theme'

export default {
  ...BlogTheme,
}
