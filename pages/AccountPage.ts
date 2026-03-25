import { expect } from '@playwright/test';
import type { Locator, Page } from 'playwright';
import {
  depositTransactionRow,
  withdrawTransactionRow,
} from '../helper/assertions';
import { delay, timeouts } from '../helper/timeouts';
import AccountPageLocators from '../objects/AccountPage/locators';
import { BasePage } from './BasePage';

/** Logged-in account: tabs, deposit/withdraw, transactions assertions. */
export class AccountPage extends BasePage {
  private readonly locators: AccountPageLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new AccountPageLocators(page);
  }

  /** Waits for a locator to be visible, then fills it with the provided value. */
  private async fillWhenVisible(field: Locator, value: string): Promise<void> {
    await field.waitFor({ state: 'visible', timeout: timeouts.default });
    await field.fill(value);
  }

  /** Confirms we are on the account dashboard (welcome text is visible). */
  async expectAccountLoaded(): Promise<void> {
    await expect(this.locators.welcome()).toBeVisible({
      timeout: timeouts.assertion,
    });
  }

  /** Clicks a top tab by its label (Deposit, Withdrawl, Transactions). */
  async openTab(tabName: string): Promise<void> {
    await this.locators.tabButton(tabName).click();
  }

  /** Opens the deposit panel. */
  async openDepositTab(): Promise<void> {
    await this.openTab(AccountPageLocators.labels.depositTab);
  }

  /** Opens the withdraw panel. */
  async openWithdrawTab(): Promise<void> {
    await this.openTab(AccountPageLocators.labels.withdrawTab);
  }

  /** Opens Transactions and waits until the history table is visible. */
  async openTransactionsTab(): Promise<void> {
    await this.openTab(AccountPageLocators.labels.transactionsTab);
    await this.locators.transactionsTableBody().waitFor({
      state: 'visible',
      timeout: timeouts.default,
    });
  }

  /** Types a deposit amount into the deposit form input. */
  async enterDepositAmount(amount: string): Promise<void> {
    await this.fillWhenVisible(this.locators.depositAmountField(), amount);
  }

  /** Clears the deposit input (used for required/negative validation). */
  async clearDepositAmount(): Promise<void> {
    await this.fillWhenVisible(this.locators.depositAmountField(), '');
  }

  /** Enters text into the deposit number field (used to trigger HTML5 invalid state). */
  async typeIntoDepositAmountField(text: string): Promise<void> {
    const field = this.locators.depositAmountField();
    await field.waitFor({ state: 'visible', timeout: timeouts.default });
    await field.fill('');
    await field.pressSequentially(text, { delay: 20 });
  }

  /** Submits the deposit form and waits briefly for the app to persist the tx. */
  async submitDeposit(): Promise<void> {
    await this.locators.depositSubmitButton().click();
    await delay(timeouts.postDepositSubmitBufferMs);
  }

  /** Full deposit flow: open Deposit → enter amount → submit. */
  async deposit(amount: string): Promise<void> {
    await this.openDepositTab();
    await this.enterDepositAmount(amount);
    await this.submitDeposit();
  }

  /** Types a withdrawal amount into the withdraw form input. */
  async enterWithdrawAmount(amount: string): Promise<void> {
    await this.fillWhenVisible(this.locators.withdrawAmountField(), amount);
  }

  /** Submits the withdraw form and waits briefly for the app to persist the tx. */
  async submitWithdraw(): Promise<void> {
    await this.locators.withdrawSubmitButton().click();
    await delay(timeouts.postDepositSubmitBufferMs);
  }

  /** Asserts a transactions row exists for the given deposit amount (Credit). */
  async expectDepositTransactionVisible(amount: string): Promise<void> {
    await expect(depositTransactionRow(this.page, amount).first()).toBeVisible({
      timeout: timeouts.assertion,
    });
  }

  /** Asserts a transactions row exists for the given withdrawal amount (Debit). */
  async expectWithdrawTransactionVisible(amount: string): Promise<void> {
    await expect(withdrawTransactionRow(this.page, amount).first()).toBeVisible({
      timeout: timeouts.assertion,
    });
  }

  /** Asserts the deposit input is invalid in HTML5 (required/number constraint). */
  async expectDepositAmountFieldInvalid(): Promise<void> {
    await expect(this.locators.depositAmountField()).toHaveJSProperty(
      'validity.valid',
      false
    );
  }
}
