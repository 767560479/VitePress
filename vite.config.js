/*
 * @Description: 
 * @Author: zhengfei.tan
 * @Date: 2023-09-06 01:54:26
 * @FilePath: \VitePress\vite.config.js
 * @LastEditors: zhengfei.tan
 * @LastEditTime: 2023-09-06 01:54:30
 */
import { defineConfig } from 'vite';



export default defineConfig({
  resolve: {
    alias: {
      'tslib': 'tslib/tslib.es6.js',
    },
  }
});