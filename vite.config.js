import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({ plugins:[vue()], base:'/NPC-city/', build:{ target:'es2022', chunkSizeWarningLimit:1600 } })
