import type { Locator, Page } from 'playwright';

const xpath = (e: string) => `xpath=${e}` as const;

const SELECTORS = { userSelect: xpath('//select[@id="userSelect"]') } as const;

export default class LoginPageLocators {
  /** Visible labels for the login flow. */
  static readonly labels = {
    customerLoginButton: 'Customer Login',
    loginButton: 'Login',
  } as const;

  constructor(readonly page: Page) {}

  readonly userSelect = (): Locator => this.page.locator(SELECTORS.userSelect);

  readonly customerLoginButton = (): Locator =>
    this.page.getByRole('button', {
      name: LoginPageLocators.labels.customerLoginButton,
      exact: true,
    });

  readonly loginButton = (): Locator =>
    this.page.getByRole('button', {
      name: LoginPageLocators.labels.loginButton,
      exact: true,
    });
  }



