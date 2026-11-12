import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm build && pnpm exec tsx server/server.ts',
    url: 'http://localhost:4173/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      PORT: '4173',
    },
  },
})
