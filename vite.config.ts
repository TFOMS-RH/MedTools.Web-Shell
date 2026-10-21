import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],

  server: {
    proxy: {
      "/api/identity": {
        target: "http://localhost:8007",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/identity/, "/api"),
      },
      "/api/med-tools": {
        target: "http://localhost:8005",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/med-tools/, "/api"),
      },
      "/api/health-track": {
        target: "http://localhost:8006",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/health-track/, "/api"),
      },
    },
  },
});
