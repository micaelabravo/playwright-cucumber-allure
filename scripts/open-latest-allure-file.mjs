// Opens the latest generated Allure HTML report (timestamped folder).
// This avoids browser caching problems from re-opening the same fixed directory.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

function openIndexHtml(indexAbs) {
  if (!existsSync(indexAbs)) {
    console.error(`Missing ${indexAbs}. Run report generation first.`);
    process.exit(1);
  }

  // Cache-bust the index URL itself so the browser reloads the HTML shell.
  const cb = Date.now();
  const url = `${pathToFileUrl(indexAbs)}?cb=${cb}`;

  if (process.platform === 'darwin') execSync(`open "${url}"`, { stdio: 'inherit' });
  else if (process.platform === 'win32') execSync(`start "" "${url}"`, { shell: true, stdio: 'inherit' });
  else execSync(`xdg-open "${url}"`, { stdio: 'inherit' });
}

function pathToFileUrl(p) {
  // Minimal cross-platform conversion to file:// URL.
  const abs = path.resolve(p);
  if (process.platform === 'win32') {
    const winPath = abs.replace(/\\/g, '/');
    return `file:///${winPath}`;
  }
  return `file://${abs}`;
}

const reportsRoot = path.join(process.cwd(), 'reports');
const fixed = path.join(reportsRoot, 'allure-report', 'index.html');

const entries = readdirSync(reportsRoot, { withFileTypes: true });
const candidates = entries
  .filter((e) => e.isDirectory() && e.name.startsWith('allure-report-'))
  .map((e) => ({
    name: e.name,
    abs: path.join(reportsRoot, e.name),
    mtimeMs: statSync(path.join(reportsRoot, e.name)).mtimeMs,
  }))
  .sort((a, b) => b.mtimeMs - a.mtimeMs);

const latestAbs = candidates[0]?.abs ?? path.join(reportsRoot, 'allure-report');
const latestIndex = path.join(latestAbs, 'index.html');

openIndexHtml(latestIndex);

console.log(latestAbs);

