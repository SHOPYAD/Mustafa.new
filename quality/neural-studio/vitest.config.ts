import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
const source = fileURLToPath(new URL("../../lonaliza-platform/admin-panel/src/", import.meta.url));
export default defineConfig({
  resolve: { alias: { "@": source } },
  test: { environment: "node", include: [source + "lib/neural-studio/**/*.test.ts"] },
});
