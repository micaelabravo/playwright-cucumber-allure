// Generates a fresh Allure HTML report into a unique, timestamped folder.
// This avoids "old report" issues caused by browser caching when using a fixed output dir.
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const dockerMode = process.argv.includes('--docker');

const resultsDirRel = path.join('reports', 'allure-results');
const resultsDirAbs = path.resolve(resultsDirRel);

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const outRel = path.join('reports', `allure-report-${ts}`);
const outAbs = path.resolve(outRel);

mkdirSync(outAbs, { recursive: true });

if (dockerMode) {
  // Generate inside Docker and write the HTML output into the timestamped folder on the host.
  execSync(
    [
      'docker',
      'run',
      '--rm',
      '-v',
      `"${path.resolve(resultsDirRel)}:/allure/results"`,
      '-v',
      `"${outAbs}:/allure/report"`,
      'qameta/allure:latest',
      'allure',
      'generate',
      '/allure/results',
      '-o',
      '/allure/report',
      '--clean',
    ].join(' '),
    { stdio: 'inherit', shell: true }
  );
} else {
  execSync(
    `allure generate "${resultsDirAbs}" -o "${outAbs}" --clean`,
    { stdio: 'inherit' }
  );
}

// Print the output directory path so debugging / scripting is easy.
console.log(outAbs);

