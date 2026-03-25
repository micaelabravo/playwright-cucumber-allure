import { Given, Then, When } from '@cucumber/cucumber';
import type { Page } from 'playwright';
import { env } from '../config/env';
import { CustomWorld } from '../fixtures/world';
import CommonLocators from '../objects/common/locators';
import { AccountPage } from '../pages/AccountPage';
import { LoginPage } from '../pages/LoginPage';

/** Step definitions → page objects (`features/banking/*.feature`). */
function getPage(world: CustomWorld): Page {
  return world.page!;
}

/** Returns the LoginPage object for the current scenario. */
function loginPage(world: CustomWorld): LoginPage {
  return new LoginPage(getPage(world));
}

/** Returns the AccountPage object for the current scenario. */
function accountPage(world: CustomWorld): AccountPage {
  return new AccountPage(getPage(world));
}

/** Opens the GlobalSQA banking page. */
Given('the banking login page is open', async function (this: CustomWorld) {
  await loginPage(this).goto(env.baseUrl);
});

/** Generic step: click a button by its visible text. */
When('I click {string}', async function (this: CustomWorld, label: string) {
  await new CommonLocators(getPage(this)).buttonExact(label).click();
});

/** Chooses the customer name from the dropdown and stays on the customer login screen. */
When(
  'I select customer {string} from the dropdown',
  async function (this: CustomWorld, customerName: string) {
    await loginPage(this).selectCustomer(customerName);
  }
);

/** Clicks a tab/button like Deposit, Withdrawl, or Transactions. */
When(
  'I open the {string} tab',
  async function (this: CustomWorld, tabName: string) {
    await accountPage(this).openTab(tabName);
  }
);

/** Deposits an amount via the Deposit tab workflow. */
When(
  'I enter {string} into the deposit amount field',
  async function (this: CustomWorld, amount: string) {
    await accountPage(this).enterDepositAmount(amount);
  }
);

/** Clears the deposit input (to test required/empty validation). */
When('I clear the deposit amount field', async function (this: CustomWorld) {
  await accountPage(this).clearDepositAmount();
});

/** Types non-numeric characters into the deposit number field. */
When(
  'I type {string} into the deposit amount field',
  async function (this: CustomWorld, text: string) {
    await accountPage(this).typeIntoDepositAmountField(text);
  }
);

/** Submits the deposit form. */
When('I submit the deposit', async function (this: CustomWorld) {
  await accountPage(this).submitDeposit();
});

/** Types a withdraw amount into the withdraw number field. */
When(
  'I enter {string} into the withdraw amount field',
  async function (this: CustomWorld, amount: string) {
    await accountPage(this).enterWithdrawAmount(amount);
  }
);

/** Submits the withdraw form. */
When('I submit the withdraw', async function (this: CustomWorld) {
  await accountPage(this).submitWithdraw();
});

/** Convenience step: full deposit (tab → enter → submit). */
When(
  'I deposit amount {string}',
  async function (this: CustomWorld, amount: string) {
    await accountPage(this).deposit(amount);
  }
);

/** Confirms we are on the customer account dashboard. */
Then('I should see the customer account area', async function (this: CustomWorld) {
  await accountPage(this).expectAccountLoaded();
});

/** Asserts the transactions table contains a Credit (deposit) row for this amount. */
Then(
  'I should see a deposit transaction for amount {string}',
  async function (this: CustomWorld, amount: string) {
    await accountPage(this).expectDepositTransactionVisible(amount);
  }
);

/** Asserts the transactions table contains a Debit (withdrawal) row for this amount. */
Then(
  'I should see a withdraw transaction for amount {string}',
  async function (this: CustomWorld, amount: string) {
    await accountPage(this).expectWithdrawTransactionVisible(amount);
  }
);

/** Asserts browser HTML5 validation blocks the deposit submit (invalidity check). */
Then(
  'the deposit amount field should be invalid',
  async function (this: CustomWorld) {
    await accountPage(this).expectDepositAmountFieldInvalid();
  }
);
