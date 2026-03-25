import path from 'node:path';

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

function isCi(): boolean {
  return ['1', 'true', 'yes'].includes((process.env.CI ?? '').toLowerCase());
}

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

/** Headed locally by default; headless in CI unless `HEADED` is set. */
function resolveHeaded(): boolean {
  if (process.env.HEADED !== undefined) return parseBool(process.env.HEADED, false);
  return !isCi();
}

function parseIntSafe(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Loaded from `.env` / process (see `support/setup.ts`). */
export const env = {
  baseUrl:
    process.env.BASE_URL ??
    'https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login',
  headed: resolveHeaded(),
  browser: (process.env.BROWSER as BrowserName) || 'chromium',
  slowMo: parseIntSafe(process.env.SLOW_MO, 0),
};
