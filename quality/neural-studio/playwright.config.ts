import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./browser", workers: 1, retries: 0, reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4173", viewport: { width: 1672, height: 941 }, locale: "ar-SA", reducedMotion: "reduce", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "pnpm dev", url: "http://127.0.0.1:4173", reuseExistingServer: false, timeout: 60000 },
});
