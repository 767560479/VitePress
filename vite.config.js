/*
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2023-09-06 01:54:26
 * @FilePath: \VitePress\vite.config.js
 * @LastEditors: zhengfei.tan
 * @LastEditTime: 2023-09-26 14:27:24
 */
import { defineConfig } from 'vite';


// ndoe  v16.20.2
export default defineConfig({
  resolve: {
    alias: {
      'tslib': 'tslib/tslib.es6.js',
    },
  }
});