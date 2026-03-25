import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const index = path.join('reports', 'allure-report', 'index.html');
if (!existsSync(index)) {
  console.error(`Missing ${index}. Run npm run report:generate first.`);
  process.exit(1);
}

const abs = path.resolve(index);
if (process.platform === 'darwin') execSync(`open "${abs}"`, { stdio: 'inherit' });
else if (process.platform === 'win32')
  execSync(`start "" "${abs}"`, { shell: true, stdio: 'inherit' });
else execSync(`xdg-open "${abs}"`, { stdio: 'inherit' });
