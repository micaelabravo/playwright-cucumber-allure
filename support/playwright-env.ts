/** Runs before importing Playwright; fixes bad `PLAYWRIGHT_BROWSERS_PATH` in some sandboxes. */
const p = process.env.PLAYWRIGHT_BROWSERS_PATH;
if (p && p !== '0' && p.includes('cursor-sandbox-cache')) {
  delete process.env.PLAYWRIGHT_BROWSERS_PATH;
}
