import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    watch: {
      // Exclude locked/copy image files that crash the watcher on Windows
      ignored: ["**/public/models/**/*Copy*", "**/public/models/**/* *"]
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"]
  }
});
