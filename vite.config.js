import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const codespacesTarget = process.env.CODESPACE_NAME
  ? `https://${process.env.CODESPACE_NAME}-4000.app.github.dev`
  : 'http://localhost:4000'

const createProxyConfig = () => ({
  target: codespacesTarget,
  changeOrigin: true,
  secure: false
})

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': createProxyConfig(),
      '/users': createProxyConfig(),
      '/services': createProxyConfig(),
      '/items': createProxyConfig(),
      '/bookings': createProxyConfig()
    }
  }
})
