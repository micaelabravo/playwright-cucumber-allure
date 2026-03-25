// Cucumber + Playwright expect defaults (loaded after playwright-env).
import 'dotenv/config';
import { setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { timeouts } from '../helper/timeouts';
import { CustomWorld } from '../fixtures/world';

setDefaultTimeout(Math.max(timeouts.navigation, timeouts.assertion) + 30_000);
expect.configure({ timeout: timeouts.assertion });
setWorldConstructor(CustomWorld);
