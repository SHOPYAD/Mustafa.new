import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
const source = fileURLToPath(new URL("../../lonaliza-platform/admin-panel/src/", import.meta.url));
export default defineConfig({
  resolve: { alias: { "@": source } },
  esbuild: { jsx: "automatic" },
  server: { fs: { allow: [fileURLToPath(new URL("../..", import.meta.url))] } },
});
