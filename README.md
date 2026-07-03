# WorkPay Tracker

WorkPay Tracker is a local-first React web app for tracking salary, overtime, allowances, bonus/extra income, percentage-based budgets, expenses, monthly income, and yearly savings. The interface is English-only, calendar-first, mobile-friendly, and designed for quick daily OT and expense entry.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Recharts
- date-fns
- lucide-react
- Browser LocalStorage for offline-first persistence

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`.

## Build

```bash
npm run build
```

## Preview the Production Build

```bash
npm run preview
```

Because this app is configured for GitHub Pages, Vite builds assets with this base path:

```text
/workpay-tracker/
```

If you preview locally, open the URL printed by Vite and include the project path when needed, for example:

```text
http://localhost:4173/workpay-tracker/
```

## Main Features

- 6 simple pages: Home, Calendar, Budget, Monthly, Year, and Settings
- Calendar-first OT workflow: tap a date, enter OT hours, choose multiplier, add a note, and save
- Large Home income overview with this month's estimated income
- Budget page with percentage-based category allocations, expense tracking, money left, and safe-to-spend today
- Monthly summary with salary, OT pay, meal allowance, transport allowance, bonus/extra pay, and daily OT records
- Year summary with YTD income, expenses, net saved, saving rate, monthly breakdown, OT totals, and bonus/extra totals
- Editable salary records, OT divisor, OT multipliers, allowances, budget allocations, categories, recurring expenses, privacy mode, and data tools in Settings
- Privacy mode that hides money values while keeping OT hours visible
- JSON export/import
- Mobile bottom navigation and desktop sidebar with only 5 main pages

## Data Storage

All data is saved locally in `localStorage` under `workpay-tracker-data-v1`. No backend or authentication is required for the MVP, and the app continues to work offline after the initial load. LocalStorage data is saved per browser and per device, so data entered on one phone or browser will not automatically appear on another.

## Calculation Formula

Hourly rate:

```text
hourlyRate = monthlySalary / otHourDivisor
```

OT base pay:

```text
otBasePay = hourlyRate * otHours * otMultiplier
```

Meal allowance:

```text
otHours < 1                       => 0
1 <= otHours < extraMealThreshold => mealAllowanceAmount
otHours >= extraMealThreshold     => mealAllowanceAmount * 2
```

Transport allowance:

```text
otHours < 1                  => 0
1 <= otHours < cutoffHours   => transportAllowanceAmount
otHours >= cutoffHours       => 0
```

Daily OT total:

```text
dailyOtTotal = otBasePay + mealAllowance + transportAllowance
```

Monthly income:

```text
monthlySalary + totalDailyOtIncome + confirmedOrPaidExtraIncome
```

Salary is selected by the latest salary record whose effective date is active for the selected month.

## Budget Formula

Category budget amount:

```text
categoryBudgetAmount = monthlyIncome * allocationPercent / 100
```

Money left:

```text
moneyLeft = monthlyIncome - totalActualExpenses
```

Safe to spend today uses spending categories only:

```text
safeToSpendToday = (spendingBudgetTotal - spendingActualTotal) / daysRemaining
```

Saving and investment categories are tracked in the budget, but they are not treated as daily spendable money.

## Reset Sample Data

Go to `Settings` and click `Reset Demo Data`. The demo dataset includes salary changes, bonus records, realistic daily OT logs, default budget allocations, expense categories, expense records, and one recurring expense for 2026.

## Deploy to GitHub Pages

This app is prepared for a repository named `workpay-tracker` and will be served from:

```text
https://<github-username>.github.io/workpay-tracker/
```

The required Vite setting is already configured in `vite.config.ts`:

```ts
base: '/workpay-tracker/'
```

If the repository name changes, update this base path to match the new repo name.

### Manual Deploy

The project includes `gh-pages` for manual deployment.

```bash
npm install
npm run deploy
```

`npm run deploy` runs `npm run build` first, then publishes the `dist` folder to the `gh-pages` branch.

In GitHub repository settings:

1. Open `Settings` -> `Pages`.
2. Under `Build and deployment`, choose `Deploy from a branch`.
3. Select the `gh-pages` branch and `/ (root)`.
4. Save.

### Automatic Deploy with GitHub Actions

The workflow file is included at:

```text
.github/workflows/deploy.yml
```

It runs on every push to `main`:

1. Installs dependencies with `npm ci`.
2. Builds the app with `npm run build`.
3. Uploads `dist`.
4. Deploys to GitHub Pages.

To use the GitHub Actions deployment option:

1. Open `Settings` -> `Pages`.
2. Under `Build and deployment`, choose `GitHub Actions`.
3. Push to the `main` branch.

### Blank Page or 404 Fixes

If GitHub Pages shows a blank page, check these first:

- Confirm `vite.config.ts` has `base: '/workpay-tracker/'`.
- Confirm the repository name is exactly `workpay-tracker`.
- Confirm the published URL includes `/workpay-tracker/`.
- Re-run `npm run build` and deploy again.

This app does not use React Router routes for page navigation. Pages such as Home, Calendar, Budget, Monthly, Year, and Settings are handled inside the single React app, so refreshing the deployed GitHub Pages URL should load the app instead of requiring route fallback files.

## Future Improvements

- User login and cloud sync
- IndexedDB storage for large datasets
- Real XLSX export
- PDF monthly reports
- Payslip import and comparison
- PWA install mode and notification reminders
- Tax calculation
