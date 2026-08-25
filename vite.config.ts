import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // У некоторых провайдеров рвётся передача файлов крупнее ~20–25 КБ —
    // дробим бандл на много маленьких частей вместо одного большого,
    // чтобы каждый кусок гарантированно проходил целиком.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          motion: ["framer-motion"],
          icons: ["lucide-react"],
          router: ["wouter"],
        },
      },
    },
  },
});
