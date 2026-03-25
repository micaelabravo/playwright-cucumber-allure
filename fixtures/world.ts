import type { IWorldOptions } from '@cucumber/cucumber';
import { AllureCucumberWorld } from 'allure-cucumberjs';
import type { Browser, BrowserContext, Page } from 'playwright';

/** Cucumber world: Playwright `browser` / `context` / `page` plus Allure `attach`, etc. */
export class CustomWorld extends AllureCucumberWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }
}
