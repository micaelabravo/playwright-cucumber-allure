// One-off debug: prints transaction table HTML after a deposit (not part of the test suite).
import { chromium } from 'playwright';

const url =
  'https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByRole('button', { name: 'Customer Login' }).click();
  await page.locator('#userSelect').waitFor({ state: 'visible' });
  await page.locator('#userSelect').selectOption({ label: 'Harry Potter' });
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText(/Welcome/i).waitFor({ state: 'visible', timeout: 30000 });
  await page.getByRole('button', { name: 'Deposit', exact: true }).first().click();
  await page.locator('input[ng-model="amount"]').fill('100');
  await page
    .locator('form')
    .filter({ has: page.locator('input[ng-model="amount"]') })
    .getByRole('button', { name: 'Deposit' })
    .click();
  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await page.locator('table tbody').waitFor({ state: 'visible', timeout: 30000 });
  const html = await page.locator('table').first().evaluate((el) => el.outerHTML);
  console.log(html.slice(0, 4000));
  const rows = await page.locator('table tbody tr').allTextContents();
  console.log('ROW TEXTS:', JSON.stringify(rows, null, 2));
  await browser.close();
})();
