# Playwright + Cucumber (XYZ Bank demo)

End-to-end UI tests for the [GlobalSQA Angular banking demo](https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login).  
**Cucumber** runs the scenarios, **Playwright** drives the browser, **TypeScript** holds the code, **Allure** is optional for HTML reports.

---

## Requirements

- **Node.js** 18+
- **npm**

After `npm install`, Chromium is installed via `postinstall`. If anything fails, run:

```bash
npx playwright install chromium
```

---

## Setup

```bash
npm install
cp .env.example .env   # optional; defaults work without it
```

---

## Main commands

| Command | What it does |
|--------|----------------|
| `npm run test` | Run all features: **terminal output** + `reports/cucumber.json`. **Browser window** opens locally by default. |
| `npm run test:ci` | Like tests + **Allure** raw results in `reports/allure-results`. Clears old results first (`clean-allure.mjs results`). Headless when `CI=true`. |
| `npm run test:headed` / `npm run test:headless` | Force visible or headless browser for `npm run test`. |
| `npm run test:smoke` | Only scenarios tagged `@smoke`. |
| `npm run test:regression` | Only `@regression`. |
| `npm run test:withdrawal` | Only `@withdrawal`. |
| `npm run test:negative` | Only `@negative`. |
| `npm run test:retry` | Run twice (Cucumber retry). |
| `npm run report:ci` | **`test:ci`** → **generate HTML** → **open latest report**. |
| `npm run report:generate` | Build HTML from `reports/allure-results` into a new timestamped folder under `reports/` (e.g. `reports/allure-report-<ts>`). |
| `npm run report:open` | Serves the latest report over `http://localhost` and opens it (fixes `file://` 404 issues). Same as `report:browse`. |
| `npm run report:open:file` | Open `index.html` in the system browser (no Java; hard-refresh if it looks old). |
| `npm run report:generate:docker` | Generate HTML with Docker if you don’t have Java. |
| `npm run report:all` | `report:generate` then `report:open`. |
| `npm run clean:allure` | Empty both Allure **results** and **report** folders. |

**Feature file:** `features/banking/customer_banking.feature` — deposit, withdraw, and negative scenarios (`@smoke`, `@banking`, `@regression`, plus `@withdrawal` / `@negative` where marked).

---

## Environment variables

| Variable | Meaning |
|----------|---------|
| `BASE_URL` | App URL (default is the GlobalSQA banking login page). |
| `HEADED` | `true` = show browser. `false` = headless. If unset: **visible locally**, **headless in CI** unless you set `HEADED=true`. |
| `BROWSER` | `chromium` (default), `firefox`, or `webkit`. |
| `SLOW_MO` | Milliseconds between actions (debugging). |

Allure **input** path is fixed in `cucumber-ci.json` (`reports/allure-results`).

Timeouts are in `helper/timeouts.ts`. Cucumber step timeout is set in `support/setup.ts`.

---

## Allure (HTML report)

1. Produce results: `npm run test:ci`
2. Build HTML: `npm run report:generate` (needs **Java 17+**), or `npm run report:generate:docker` with Docker
3. View: `npm run report:open` (recommended)

One-liner: `npm run report:ci` (runs tests + generate + open).

Install Java (e.g. [Eclipse Temurin 17](https://adoptium.net/)), then check with `java -version`.  
If you see *Unable to locate a Java Runtime*, install a JDK and open a new terminal.

`report:generate` writes into a new timestamped folder each run, so you don’t mix with an older report. `test:ci` clears **`reports/allure-results`** so the report reflects **only the latest run**.

---

## IDE / Cursor note

Some sandboxes set `PLAYWRIGHT_BROWSERS_PATH` to a folder without browsers. The project loads **`support/playwright-env.ts` first** (see `cucumber.json`) and unsets that path when it looks like a broken Cursor cache so Playwright uses its normal install.

---

## Project layout

| Folder / file | Role |
|---------------|------|
| `features/` | `.feature` scenarios |
| `steps/` | Step definitions → page objects |
| `pages/` | Page actions (POM) |
| `objects/` | Locators per page |
| `hooks/` | Browser lifecycle, **screenshot after each step**, extra screenshot on failure |
| `fixtures/` | Shared browser + Cucumber `CustomWorld` |
| `helper/` | Timeouts, transaction row assertions |
| `support/` | `dotenv`, Cucumber + `expect` setup, Playwright env fix |
| `config/` | `env` object from process / `.env` |
| `scripts/` | `ensure-dirs`, `clean-allure.mjs`, optional `open-allure-html.mjs` |
| `reports/` | Outputs (gitignored): `cucumber.json`, Allure folders |
| `cucumber.json` | Local runs: pretty + JSON (no Allure) |
| `cucumber-ci.json` | CI / Allure: pretty + JSON + `allure-cucumberjs` |

---

## How it works (short)

- **One browser** for the whole run; **new context + page** for each scenario.
- **`npm run test`** keeps the console readable by **not** attaching the Allure reporter.
- **`@playwright/test`** is used for **`expect`** only; the runner is Cucumber.
- **Screenshots:** every step attaches a PNG to the report; failures attach one more before closing the page.
