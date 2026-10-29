# Playwright Screening Task

Playwright Test + TypeScript tests for the [TodoMVC demo](https://demo.playwright.dev/todomvc) and [playwright.dev](https://playwright.dev), run in Chromium and Firefox.

**CI run:** (https://github.com/Yadee9910/playwright-screening/actions/runs/40832451510)

## Install

Requires Node.js 18+.

```bash
npm ci
npx playwright install --with-deps chromium firefox
```

## Run

| Command | What it does |
| --- | --- |
| `npm test` | Run all tests (Chromium + Firefox, in parallel) |
| `npm run test:headed` | Run with visible browsers |
| `npm run test:chromium` | Run only in Chromium |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | TypeScript check |

## Project structure

```
pages/TodoPage.ts            Page object: locators and actions for TodoMVC
fixtures/index.ts            test.extend() that provides a ready TodoPage
tests/todomvc/todo.spec.ts   TodoMVC tests (Part 2)
tests/docs/playwright-dev.spec.ts   playwright.dev tests (Part 3)
playwright.config.ts         baseURL, Chromium/Firefox projects, CI retries, trace, HTML report
.github/workflows/playwright.yml    CI: install, run, upload report
```

## Key decisions

- **Page object + fixture:** tests ask for `todoPage` and get the app already open. The page object holds locators and actions; assertions stay in the tests so each test reads as its own spec.
- **Two sites, one config:** `baseURL` points at TodoMVC. The docs spec overrides it with `test.use({ baseURL: 'https://playwright.dev' })`, so the config keeps just two projects (one per browser).
- **Locators:** only `getByRole`, `getByPlaceholder` and `getByText`. Todo rows are list items that contain a "Toggle Todo" checkbox, which keeps the footer filter links out of the list.
- **Waiting:** no sleeps. Everything relies on auto-waiting and web-first assertions (`toHaveText`, `toHaveCount`, `toHaveURL`). The reload test waits for the app to save to localStorage using a condition (`waitForFunction`), not a timer.
- **Independence:** each test gets a fresh browser context (empty localStorage) and creates its own data, so all tests run in parallel (`fullyParallel: true`).
- **CI behaviour:** retries only on CI (`retries: 2`), trace recorded on first retry, HTML report always uploaded, `test.only` blocked by `forbidOnly`.

## Dealing with a flaky test

First I reproduce it, running it many times with `--repeat-each=20` and with CI-like worker counts, then open the trace from the failed attempt to see what the page actually looked like at that moment. Most flakiness comes from a race (asserting before the app has finished), shared state between tests, or a locator that matches more than one thing, so I fix that root cause rather than adding sleeps or more retries. If it can't be fixed right away, I quarantine it with `test.fixme()` and a linked ticket, so it stays visible without blocking the pipeline or hiding real failures.
