import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // 处理 jsonlint 包中的 Node.js 模块
      define: {
        global: 'globalThis',
      },
      plugins: [
        {
          name: 'fix-jsonlint',
          setup(build) {
            // 处理 file 模块
            build.onResolve({ filter: /^file$/ }, () => {
              return { path: 'file', namespace: 'fix-jsonlint-ns' }
            })
            build.onLoad({ filter: /.*/, namespace: 'fix-jsonlint-ns' }, () => {
              return {
                contents: `
                  export function path() { return ''; }
                  export function cwd() { return ''; }
                `,
                loader: 'js'
              }
            })
            
            // 处理 system 模块
            build.onResolve({ filter: /^system$/ }, () => {
              return { path: 'system', namespace: 'fix-jsonlint-ns' }
            })
            build.onLoad({ filter: /.*/, namespace: 'fix-jsonlint-ns' }, () => {
              return {
                contents: `export const args = [];`,
                loader: 'js'
              }
            })
          }
        }
      ]
    }
  }
})
