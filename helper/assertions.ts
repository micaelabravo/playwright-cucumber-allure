import type { Locator, Page } from 'playwright';
import AccountPageLocators from '../objects/AccountPage/locators';

/** Transaction row matching amount (whole cell) and Credit or Debit. */
export function depositTransactionRow(page: Page, amount: string): Locator {
  return transactionRowByType(page, amount, AccountPageLocators.patterns.transactionCreditType);
}

export function withdrawTransactionRow(page: Page, amount: string): Locator {
  return transactionRowByType(page, amount, AccountPageLocators.patterns.transactionDebitType);
}

/**
 * Shared implementation:
 * - finds rows in the transactions table
 * - matches a whole-cell amount (so "50" does not match "12:50")
 * - matches the transaction type ("Credit" for deposits, "Debit" for withdrawals).
 */
function transactionRowByType(
  page: Page,
  amount: string,
  typePattern: RegExp
): Locator {
  const locators = new AccountPageLocators(page);
  const digits = amount.replace(/[^\d.]/g, '');
  const amountCell = new RegExp(`^\\s*\\$?${digits}(\\.\\d{1,2})?\\s*$`);
  return locators
    .transactionRows()
    .filter({ has: locators.transactionTableCell(amountCell) })
    .filter({ has: locators.transactionTableCell(typePattern) });
}
