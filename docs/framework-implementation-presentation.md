# Playwright + Cucumber + Allure
## Framework Implementation Presentation

---

## 1) Purpose and Scope

- Build a maintainable UI automation framework for the GlobalSQA XYZ Bank demo app.
- Use BDD scenarios (`.feature`) for business readability.
- Use Playwright for browser automation, Cucumber as the test runner, TypeScript for code quality.
- Add reporting, screenshots, and CI execution so the framework is usable locally and in pipelines.

---

## 2) What Was Implemented

- **BDD test suite** for deposit, withdrawal, and negative validation scenarios.
- **POM architecture** with separate page actions and locator classes.
- **Custom Cucumber world** that stores Playwright runtime objects per scenario.
- **Lifecycle hooks** for browser/context/page management and screenshot attachments.
- **Environment-driven execution** (`BASE_URL`, `HEADED`, `BROWSER`, `SLOW_MO`, CI behavior).
- **Allure report pipeline** (results generation, HTML generation, local report serving).
- **GitHub Actions workflow** to run tests and upload artifacts on push/PR.

---

## 3) Project Architecture (Layered)

- `features/` -> business scenarios written in Gherkin.
- `steps/` -> step definitions mapping Gherkin steps to code actions.
- `pages/` -> reusable business actions and assertions per page.
- `objects/` -> centralized selectors and UI labels/patterns.
- `hooks/` + `fixtures/` -> runtime lifecycle and shared browser/session state.
- `helper/` -> timeouts, delays, transaction row assertion utilities.
- `support/` + `config/` -> bootstrap, world registration, env resolution.
- `scripts/` + `.github/workflows/` -> reporting automation and CI orchestration.

---

## 4) End-to-End Execution Flow

1. Cucumber reads scenario steps from `features/banking/customer_banking.feature`.
2. `steps/banking.steps.ts` resolves each step and calls page methods.
3. `pages/LoginPage.ts` and `pages/AccountPage.ts` execute UI workflows.
4. Locator classes in `objects/` provide selectors and patterns.
5. Assertion helpers in `helper/assertions.ts` validate transaction rows robustly.
6. Hooks capture screenshots after each step and on failures.
7. Output is written to `reports/cucumber.json` and optionally `reports/allure-results`.

---

## 5) BDD Coverage Implemented

### Feature: Customer banking

- **Scenario outline:** deposit flow by customer + amount.
- **Scenario:** withdrawal flow validates debit transaction.
- **Negative:** empty deposit is blocked (HTML5 invalid).
- **Negative:** non-numeric deposit input is invalid.
- **Tags:** `@smoke`, `@banking`, `@regression`, `@withdrawal`, `@negative`.

---

## 6) Page Object Model Implementation

### Login area

- `LoginPage.goto()` opens the app and waits for page load.
- `selectCustomer()` and `clickLogin()` implement customer login steps.

### Account area

- `openTab()` supports Deposit / Withdrawl / Transactions navigation.
- `enterDepositAmount()`, `submitDeposit()`, `enterWithdrawAmount()`, `submitWithdraw()` handle core transactions.
- `expectAccountLoaded()` validates successful login state.
- `expectDepositTransactionVisible()` and `expectWithdrawTransactionVisible()` verify transaction history.
- `expectDepositAmountFieldInvalid()` validates browser-level form constraints.

---

## 7) Locator Strategy and Separation

- `objects/LoginPage/locators.ts` isolates login page selectors.
- `objects/AccountPage/locators.ts` isolates account area selectors and reusable patterns.
- `objects/common/locators.ts` supports shared generic actions (e.g., exact button click).
- Benefit: when UI selectors change, updates are localized in locator files.

---

## 8) Assertion Helper Enhancement

### `helper/assertions.ts`

- Adds a shared function to locate a transaction row by:
  - amount cell (whole-cell regex, avoids partial false matches),
  - transaction type (Credit vs Debit pattern).
- Exposes:
  - `depositTransactionRow(page, amount)`
  - `withdrawTransactionRow(page, amount)`
- Connection: used by `AccountPage` assertion methods, which are called by `Then` steps.

---

## 9) Runtime Lifecycle and Isolation

### Shared browser + isolated scenarios

- `BeforeAll`: launches one shared browser for efficiency.
- `Before`: creates new browser context + page per scenario.
- `After`: closes page/context to prevent cookie/storage leakage.
- `AfterAll`: closes shared browser cleanly.

### Diagnostics

- `AfterStep`: attaches full-page screenshot for every step.
- `After` (failed scenario): attaches extra failure screenshot.

---

## 10) World, Setup, and Environment

- `fixtures/world.ts`: custom world extends `AllureCucumberWorld` and holds `browser/context/page`.
- `support/setup.ts`:
  - loads `.env`,
  - configures Cucumber default timeout,
  - configures Playwright `expect` timeout,
  - registers `CustomWorld`.
- `support/playwright-env.ts`: protects runs from invalid sandboxed `PLAYWRIGHT_BROWSERS_PATH`.
- `config/env.ts`: resolves runtime settings, including CI-aware headed/headless defaults.

---

## 11) Reporting and Allure Tooling

- `cucumber.json` (local): pretty formatter + JSON report.
- `cucumber-ci.json` (CI/reporting): adds `allure-cucumberjs` reporter.
- Scripts implemented:
  - `clean-allure.mjs`: removes old results/reports.
  - `generate-allure.mjs`: creates timestamped `allure-report-*` folders.
  - `open-latest-allure-server-node.mjs`: serves newest report over HTTP.
  - `open-allure-html.mjs`: fallback direct file opener.
  - `ensure-dirs.mjs`: pre-creates report directories.

---

## 12) CI/CD Integration Added

### GitHub Actions: `.github/workflows/cucumber-e2e.yml`

- Triggers on push and pull request to `main`/`master`.
- Sets up Node 20, installs dependencies, installs Chromium with deps.
- Executes `npm run test:ci`.
- Uploads artifacts (always):
  - `reports/cucumber.json`
  - `reports/allure-results`

Result: automated validation and downloadable evidence per run.

---

## 13) Command Model Implemented

- `npm run test` -> core local run.
- `npm run test:ci` -> CI-style run + Allure raw data.
- Tag-focused runs (`test:smoke`, `test:regression`, `test:withdrawal`, `test:negative`).
- Report actions (`report:generate`, `report:open`, `report:ci`, Docker-based generation).
- Utility (`clean:allure`) to keep report state deterministic.

---

## 14) How Everything Connects (Traceability Map)

- **Gherkin step** -> matched in `steps/banking.steps.ts`.
- **Step definition** -> calls `LoginPage`/`AccountPage` method.
- **Page method** -> uses locator factory from `objects/.../locators.ts`.
- **Validation method** -> uses Playwright `expect` and assertion helpers.
- **Hooks** -> add screenshots and enforce test isolation.
- **Formatters/reporters** -> serialize run data into JSON/Allure outputs.
- **Scripts/CI** -> transform outputs into shareable artifacts and hosted HTML reports.

---

## 15) Operational Benefits Delivered

- Cleaner maintenance through strict separation of concerns.
- Better debuggability via step-level screenshots and stable selectors.
- More reliable assertions for financial transaction validation.
- Flexible execution for local debugging and CI automation.
- Report portability with both JSON and Allure artifact support.

---

## 16) Suggested Next Improvements

- Add API-level validation for transaction history to complement UI checks.
- Add parallel execution strategy and sharding for faster suite runtime.
- Add lint/test quality gates (TypeScript check + formatting) in CI.
- Add test data factory and customer-account fixtures for broader coverage.
- Add flaky-test analytics using Allure history/trends in CI.

