import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['1bda-41-85-163-227.ngrok-free.app', 'localhost'], // Ajoutez votre URL Ngrok ici
  },
})
