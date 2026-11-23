import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        nuxt: fileURLToPath(new URL('./src/nuxt.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_outputFormat, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: ['vue', 'tailwind-variants', 'lucide-vue-next', '@nuxt/kit', '@tailwindcss/vite'],
    },
  },
})
