import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    root: './frontend',
    server: {
        port: 8082,
    },
    plugins: [vue()],
    build: {
        outDir: '../../dist/hey-i18n-studio/frontend',
        emptyOutDir: true,
    },
})
