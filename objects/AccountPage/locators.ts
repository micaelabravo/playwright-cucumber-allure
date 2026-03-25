import type { Locator, Page } from 'playwright';

const xpath = (e: string) => `xpath=${e}` as const;

const SELECTORS = {
  transactionsTableBody: xpath(
    '//table[contains(@class,"table-bordered")]//tbody'
  ),
  transactionRows: xpath(
    '//table[contains(@class,"table-bordered")]//tbody//tr'
  ),
  tableCell: 'td',
  depositAmountInput: xpath(
    '//form[@ng-submit="deposit()"]//input[@type="number"]'
  ),
  depositSubmitButton: xpath(
    '//form[@ng-submit="deposit()"]//button[@type="submit"]'
  ),
  withdrawAmountInput: xpath(
    '//form[@ng-submit="withdrawl()"]//input[@type="number"]'
  ),
  withdrawSubmitButton: xpath(
    '//form[@ng-submit="withdrawl()"]//button[@type="submit"]'
  ),
} as const;

/** Selectors for account tabs, deposit/withdraw forms, and the transactions table. */
export default class AccountPageLocators {
  /** Tab labels and UI text used by the account page actions. */
  static readonly labels = {
    depositTab: 'Deposit',
    transactionsTab: 'Transactions',
    withdrawTab: 'Withdrawl',
  } as const;

  /** Text patterns used to identify transaction rows (Credit / Debit). */
  static readonly patterns = {
    welcomeBanner: /Welcome/i,
    transactionCreditType: /Credit/i,
    transactionDebitType: /Debit/i,
  } as const;

  /** Keeps the page reference so each locator factory can create real Locator instances. */
  constructor(readonly page: Page) {}

  /** Welcome banner used to verify we're on the account dashboard. */
  readonly welcome = (): Locator =>
    this.page.getByText(AccountPageLocators.patterns.welcomeBanner);

  /** Tab buttons on the account dashboard. */
  readonly tabButton = (tabName: string): Locator =>
    this.page.getByRole('button', { name: tabName, exact: true }).first();

  /** Transactions table body (<tbody>) for history. */
  readonly transactionsTableBody = (): Locator =>
    this.page.locator(SELECTORS.transactionsTableBody);

  /** All transaction rows inside the table. */
  readonly transactionRows = (): Locator =>
    this.page.locator(SELECTORS.transactionRows);

  /** Deposit form amount input (depositTx.html). */
  readonly depositAmountField = (): Locator =>
    this.page.locator(SELECTORS.depositAmountInput);

  /** Deposit form submit button. */
  readonly depositSubmitButton = (): Locator =>
    this.page.locator(SELECTORS.depositSubmitButton);

  /** Withdraw form amount input (withdrawlTx.html). */
  readonly withdrawAmountField = (): Locator =>
    this.page.locator(SELECTORS.withdrawAmountInput);

  /** Withdraw form submit button. */
  readonly withdrawSubmitButton = (): Locator =>
    this.page.locator(SELECTORS.withdrawSubmitButton);

  readonly transactionTableCell = (hasText: RegExp): Locator =>
    this.page.locator(SELECTORS.tableCell).filter({ hasText });
}
