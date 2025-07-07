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
    include: [
      'jsonlint',
      'codemirror',
      'codemirror/mode/javascript/javascript',
      'codemirror/addon/lint/lint',
      'codemirror/addon/lint/json-lint',
      'codemirror/addon/fold/foldcode',
      'codemirror/addon/fold/foldgutter',
      'codemirror/addon/fold/brace-fold'
    ],
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
              return { path: 'file', namespace: 'fix-file-ns' }
            })
            build.onLoad({ filter: /.*/, namespace: 'fix-file-ns' }, () => {
              return {
                contents: `
                  export default {
                    path: () => '',
                    cwd: () => ''
                  };
                  export function path() { return ''; }
                  export function cwd() { return ''; }
                `,
                loader: 'js'
              }
            })
            
            // 处理 system 模块
            build.onResolve({ filter: /^system$/ }, () => {
              return { path: 'system', namespace: 'fix-system-ns' }
            })
            build.onLoad({ filter: /.*/, namespace: 'fix-system-ns' }, () => {
              return {
                contents: `
                  export default {
                    args: []
                  };
                  export const args = [];
                `,
                loader: 'js'
              }
            })
            
            // 处理 util 模块
            build.onResolve({ filter: /^util$/ }, () => {
              return { path: 'util', namespace: 'fix-util-ns' }
            })
            build.onLoad({ filter: /.*/, namespace: 'fix-util-ns' }, () => {
              return {
                contents: `
                  export default {
                    inherits: (ctor, superCtor) => {
                      ctor.super_ = superCtor;
                      ctor.prototype = Object.create(superCtor.prototype, {
                        constructor: {
                          value: ctor,
                          enumerable: false,
                          writable: true,
                          configurable: true
                        }
                      });
                    }
                  };
                  export function inherits(ctor, superCtor) {
                    ctor.super_ = superCtor;
                    ctor.prototype = Object.create(superCtor.prototype, {
                      constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                      }
                    });
                  }
                `,
                loader: 'js'
              }
            })
          }
        }
      ]
    }
  }
})
