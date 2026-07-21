import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Exclude locked/copy image files that crash the watcher on Windows
      ignored: ["**/public/models/**/*Copy*", "**/public/models/**/* *"]
    }
  }
});
