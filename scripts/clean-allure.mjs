// Clears Allure input/output dirs so reports are not merged with old runs.
// Usage: node scripts/clean-allure.mjs [results|report|both]
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const mode = process.argv[2] ?? 'both';
const root = join(process.cwd(), 'reports');

function wipe(sub) {
  const dir = join(root, sub);
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
}

if (mode === 'results' || mode === 'both') wipe('allure-results');

function wipeAllureReports() {
  // Fixed dir (kept for backwards compatibility with older scripts).
  const fixed = join(root, 'allure-report');
  if (existsSync(fixed)) rmSync(fixed, { recursive: true, force: true });

  // Timestamped report dirs created by scripts/generate-allure.mjs
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith('allure-report-')) {
      rmSync(join(root, entry.name), { recursive: true, force: true });
    }
  }
}

if (mode === 'report' || mode === 'both') wipeAllureReports();
