import type { Page } from 'playwright';
import LoginPageLocators from '../objects/LoginPage/locators';
import { BasePage } from './BasePage';

/** Home and customer-login flow (before the account dashboard). */
export class LoginPage extends BasePage {
  private readonly locators: LoginPageLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new LoginPageLocators(page);
  }

  /** Opens the banking URL and waits for Angular/DOM to finish loading. */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('load');
  }

  /** Clicks “Customer Login” to show the customer dropdown. */
  async clickCustomerLogin(): Promise<void> {
    await this.locators.customerLoginButton().click();
  }

  /** Selects a customer by exact label in the dropdown. */
  async selectCustomer(customerName: string): Promise<void> {
    const select = this.locators.userSelect();
    await select.waitFor({ state: 'visible' });
    await select.selectOption({ label: customerName });
  }

  /** Clicks “Login” after selecting a customer. */
  async clickLogin(): Promise<void> {
    await this.locators.loginButton().click();
  }
}
