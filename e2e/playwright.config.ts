import { defineConfig, devices } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// ADR 0006, *One end-to-end smoke test*.

const port = 3100;

// A fresh file on every run, so the start sequence seeds it and the data is the default seed. Only
// the runner starts the webServer and makes the file; workers load this config again and need none.
const databasePath =
  process.env.TEST_WORKER_INDEX === undefined
    ? join(mkdtempSync(join(tmpdir(), 'acme-e2e-')), 'app.db')
    : '';

export default defineConfig({
  testDir: 'tests',
  // A flaky failure is a bug to fix, not to retry.
  retries: 0,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    // Determinism: the browser's locale and timezone never come from the machine.
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // The built app, through the Railway start command: migrate → `seed --if-empty` → start.
    command: 'pnpm start',
    cwd: '..',
    url: `http://localhost:${port}/api/health`,
    env: { DATABASE_PATH: databasePath, PORT: String(port) },
    // Never an already running app: its database would not be a fresh default seed.
    reuseExistingServer: false,
    // The first boot seeds 10,000 employees before the server listens.
    timeout: 120_000,
  },
});
