import { chromium, firefox, webkit, type Browser } from 'playwright';
import type { BrowserName } from '../config/env';

const engines = { chromium, firefox, webkit } as const;

let sharedBrowser: Browser | null = null;

/** Launches one browser per run; returns the same instance on later calls. */
export async function launchSharedBrowser(
  name: BrowserName,
  options: { headed: boolean; slowMo: number }
): Promise<Browser> {
  if (sharedBrowser) return sharedBrowser;
  const engine = engines[name] ?? chromium;
  sharedBrowser = await engine.launch({
    headless: !options.headed,
    slowMo: options.slowMo,
  });
  return sharedBrowser;
}

export function getSharedBrowser(): Browser {
  if (!sharedBrowser) throw new Error('Shared browser was not launched');
  return sharedBrowser;
}

export async function closeSharedBrowser(): Promise<void> {
  if (!sharedBrowser) return;
  await sharedBrowser.close();
  sharedBrowser = null;
}
