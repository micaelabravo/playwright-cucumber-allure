import type { Locator, Page } from 'playwright';

/** Generic buttons (e.g. `I click "…"` steps). */
export default class CommonLocators {
  constructor(readonly page: Page) {}

  /** Finds a button by its exact accessible name (used by generic click step). */
  readonly buttonExact = (name: string): Locator =>
    this.page.getByRole('button', { name, exact: true });
}
