import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 300000,
  expect: { timeout: 60000 },
  workers: 1,
  fullyParallel: false,
  reporter: "list",
  outputDir: "artifacts/test-results",
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    channel: "chrome",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
