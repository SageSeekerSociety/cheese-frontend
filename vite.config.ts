// Plugins
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'
import { prismjsPlugin } from 'vite-plugin-prismjs'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    vueJsx(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
    }),
    ViteFonts({
      google: {
        families: [
          {
            name: 'Roboto',
            styles: 'wght@100;300;400;500;700;900',
          },
        ],
      },
    }),
    prismjsPlugin({
      // ['json', 'css'] 按需引入，'all' 所有语言
      languages: 'all',
      // 配置行号插件
      plugins: ['line-numbers', 'copy-to-clipboard'],
      // 主题名
      theme: 'okaidia',
      css: true,
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router'],
          lodash: ['lodash'],
          editorjs: ['@editorjs/editorjs'],
          editorjsPlugins: [
            '@editorjs/paragraph',
            '@editorjs/header',
            '@editorjs/quote',
            '@editorjs/delimiter',
            '@editorjs/warning',
            '@editorjs/table',
            '@editorjs/text-variant-tune',
            '@editorjs/inline-code',
            '@editorjs/underline',
            '@editorjs/checklist',
            '@editorjs/nested-list',
          ],
          editorjsLatex: ['editorjs-latex'],
          editorjsMermaid: ['editorjs-mermaid'],
          editorjsCodecup: ['@calumk/editorjs-codecup'],
          dayjs: ['dayjs'],
          // prismjs: ['prismjs'],
          katex: ['katex'],
        },
        // manualChunks(id) {
        //   console.log(id)
        // },
      },
    },
  },
  test: {
    // 启用类似 jest 的全局测试 API
    globals: true,
    // 使用 happy-dom 模拟 DOM
    // 这需要你安装 happy-dom 作为对等依赖（peer dependency）
    environment: 'happy-dom',
  },
  optimizeDeps: {
    include: ['editorjs-parser'],
  },
})
