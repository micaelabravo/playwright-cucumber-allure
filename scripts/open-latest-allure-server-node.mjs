// Serves the latest Allure HTML report over HTTP using Node.js.
// This avoids `python3` (which fails on this machine due to Xcode license checks).
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const NO_OPEN = process.env.NO_OPEN === '1' || process.env.NO_OPEN === 'true';
const PORT = process.env.ALLURE_PORT ? Number(process.env.ALLURE_PORT) : 0; // 0 => pick random port

function getLatestReportDir(reportsRoot) {
  // Find newest `allure-report-*` directory by mtime.
  return fs
    .readdir(reportsRoot, { withFileTypes: true })
    .then((entries) =>
      entries
        .filter((e) => e.isDirectory() && e.name.startsWith('allure-report-'))
        .map((e) => ({ name: e.name, abs: path.join(reportsRoot, e.name) }))
    )
    .then(async (dirs) => {
      if (dirs.length === 0) return path.join(reportsRoot, 'allure-report');
      const withMtime = await Promise.all(
        dirs.map(async (d) => ({
          abs: d.abs,
          mtimeMs: (await fs.stat(d.abs)).mtimeMs,
        }))
      );
      withMtime.sort((a, b) => b.mtimeMs - a.mtimeMs);
      return withMtime[0].abs;
    });
}

const contentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.woff2') return 'font/woff2';
  if (ext === '.map') return 'application/json; charset=utf-8';
  return 'application/octet-stream';
};

const serveStatic = (rootDir) => async (req, res) => {
  try {
    // Decode URL pathname without querystring.
    const url = new URL(req.url ?? '/', `http://localhost`);
    const pathname = decodeURIComponent(url.pathname);
    const safePath = pathname.replace(/^\//, '');

    // Allure is a SPA; for paths without an extension, serve index.html.
    const hasExt = path.extname(safePath) !== '';
    const filePath = path.join(rootDir, safePath);

    let targetPath = filePath;
    if (!hasExt) {
      targetPath = path.join(rootDir, 'index.html');
    }

    let data;
    try {
      data = await fs.readFile(targetPath);
    } catch (e) {
      if (!hasExt) {
        data = await fs.readFile(path.join(rootDir, 'index.html'));
      } else {
        res.statusCode = 404;
        res.setHeader('content-type', 'text/plain; charset=utf-8');
        res.end(`Not found: ${pathname}`);
        return;
      }
    }

    res.statusCode = 200;
    res.setHeader('content-type', contentType(targetPath));
    res.end(data);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end(`Server error: ${e instanceof Error ? e.message : String(e)}`);
  }
};

async function main() {
  const reportsRoot = path.join(process.cwd(), 'reports');
  const latestDir = await getLatestReportDir(reportsRoot);
  const indexPath = path.join(latestDir, 'index.html');

  try {
    await fs.access(indexPath);
  } catch {
    console.error(`Missing ${indexPath}. Run: npm run report:generate`);
    process.exit(1);
  }

  const server = http.createServer(serveStatic(latestDir));

  server.listen(PORT, '127.0.0.1', () => {
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : PORT;
    const url = `http://localhost:${actualPort}/`;
    console.log(`Serving: ${latestDir}`);
    console.log(`URL: ${url}`);
    console.log('Press Ctrl+C to stop.');

    if (!NO_OPEN) {
      // Best-effort open; ignore failures (system prompts, etc.).
      const cmd =
        process.platform === 'darwin'
          ? `open "${url}"`
          : process.platform === 'win32'
            ? `start "" "${url}"`
            : `xdg-open "${url}"`;
      // eslint-disable-next-line no-console
      console.log(`Opening browser (best-effort): ${cmd}`);
      // Use shell to avoid complicated platform-specific spawn.
      import('node:child_process')
        .then(({ exec }) => exec(cmd, () => undefined))
        .catch(() => undefined);
    }
  });
}

main().catch((e) => {
  console.error(`Failed to start Allure server: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});

