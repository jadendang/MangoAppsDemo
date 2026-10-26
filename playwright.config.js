import { defineConfig } from "@playwright/test";

// UI tests run against the Vite dev server in the locally installed Chrome.
export default defineConfig({
  testDir: "tests",
  use: {
    baseURL: "http://localhost:5173",
    channel: "chrome",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    { name: "phone", use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
