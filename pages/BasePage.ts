import type { Page } from 'playwright';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}
}
