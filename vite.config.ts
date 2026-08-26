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
        // По одному чанку на пакет: чем мельче файлы, тем надёжнее они
        // доходят через фильтрацию у российских провайдеров.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          const m = id.split("node_modules/")[1].split("/");
          const pkg = m[0].startsWith("@") ? `${m[0]}/${m[1]}` : m[0];
          return "v-" + pkg.replace("@", "").replace("/", "-");
        },
      },
    },
  },
});
