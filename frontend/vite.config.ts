import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/app": path.resolve(__dirname, './src/app'),
      "@/shared": path.resolve(__dirname, './src/shared'),
      "@/entities": path.resolve(__dirname, './src/entities'),
      "@/features": path.resolve(__dirname, './src/features'),
      "@/widgets": path.resolve(__dirname, './src/widgets'),
      "@/pages": path.resolve(__dirname, './src/pages'),
    },
  },
})
