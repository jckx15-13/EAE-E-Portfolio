import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps built asset URLs relative so the bundle also works when
// served from a subfolder of the main portfolio server.
export default defineConfig({
  plugins: [react()],
  base: './',
})
