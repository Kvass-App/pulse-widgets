import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue({ customElement: true })],
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        'top-level-await': true,
      },
    },
  },
  resolve: {
    extensions: ['.js', '.ts', '.json', '.vue'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
      input: {
        'packtivation-checkout': fileURLToPath(
          new URL('./src/packtivation-checkout/main.js', import.meta.url),
        ),
        'packtivation-configurator': fileURLToPath(
          new URL('./src/packtivation-configurator/main.js', import.meta.url),
        ),
        'packtivation-vipps-modal': fileURLToPath(
          new URL('./src/packtivation-vipps-modal/main.js', import.meta.url),
        ),
      },
    },
  },
  server: {
    cors: true,
    port: 3010,
  },
})
