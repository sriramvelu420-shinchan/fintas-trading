# FinTas Trading

A Next.js + React paper-trading and personal money-management demo. All market prices, orders, balances and account data are simulated. No real trades are placed and no real money is moved.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Role  | Email                       | Password  |
| ----- | --------------------------- | --------- |
| User  | `demo@fintastrading.app`    | `demo123` |
| Admin | `admin@fintastrading.app`   | `admin123` |

## Features

- Landing page, dashboard, market, stock detail, paper trading, portfolio, watchlist, alerts, notifications, money management, account and admin pages
- Server-side order validation, virtual balance updates and cookie-based auth
- Local JSON demo data store under `.fintas-data/db.json`
- **AI Mode** at `/ai` with contextual insights and a question/answer assistant
  - Works offline with a rule-based demo engine
  - Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) to connect an OpenAI-compatible model
  - The API key stays server-side and is never sent to the browser

## Notes

- Local demo data is ignored by Git.
- AI Mode is educational. It never executes trades or provides personalized financial advice.

## Production build

```bash
npm run build
npm start
```
