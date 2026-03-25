import {
  After,
  AfterAll,
  AfterStep,
  Before,
  BeforeAll,
  Status,
  type ITestCaseHookParameter,
  type ITestStepHookParameter,
} from '@cucumber/cucumber';
import { env } from '../config/env';
import {
  closeSharedBrowser,
  getSharedBrowser,
  launchSharedBrowser,
} from '../fixtures/browser-manager';
import { CustomWorld } from '../fixtures/world';
import { timeouts } from '../helper/timeouts';

// Shared screenshot options: full-page PNG after each step / extra on failure.
const screenshot = { fullPage: true as const, timeout: 15_000 };

BeforeAll(async function () {
  await launchSharedBrowser(env.browser, {
    headed: env.headed,
    slowMo: env.slowMo,
  });
});

/** Creates a fresh BrowserContext + Page for each scenario (so cookies/storage do not leak). */
Before(async function (this: CustomWorld) {
  const browser = getSharedBrowser();
  this.browser = browser;
  this.context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(timeouts.default);
  this.page.setDefaultNavigationTimeout(timeouts.navigation);
});

/** After each step, attach a screenshot to the report (helps debugging even on passes). */
AfterStep(async function (this: CustomWorld, { pickleStep }: ITestStepHookParameter) {
  const page = this.page;
  if (!page) return;
  const safe = pickleStep.text
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 100);
  try {
    const buffer = await page.screenshot(screenshot);
    await this.attach(buffer, {
      mediaType: 'image/png',
      fileName: `step-${safe || 'screenshot'}.png`,
    });
  } catch {
    /* closed page or capture timeout */
  }
});

/** After each scenario, attach an extra screenshot if the scenario failed. */
After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const page = this.page;
  if (page && scenario.result?.status === Status.FAILED) {
    const buffer = await page.screenshot(screenshot);
    await this.attach(buffer, 'image/png');
  }
  await this.page?.close().catch(() => undefined);
  await this.context?.close().catch(() => undefined);
  this.page = undefined;
  this.context = undefined;
});

/** Runs once at the end: closes the shared browser. */
AfterAll(async function () {
  await closeSharedBrowser();
});
