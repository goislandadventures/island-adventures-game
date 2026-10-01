# Island Adventures

Mobile-first charter-company management game set across a fictional tropical island chain inspired by the Florida Keys.

## Current milestone: v0.3 accounts + per-trip captain decisions

The prototype includes:

- company/captain creation and company color
- $40,000 starting cash
- three starter marina/slip choices
- used boat marketplace with tradeoffs
- insurance
- editable sandbar, snorkeling and sunset pricing
- deterministic daily weather
- demand and booking generation
- independent captain decision for every trip: run as booked, move to protected water, or cancel/reschedule
- Day 1 intentionally starts at 17 kt E with a morning sandbar and afternoon snorkel
- weather-sensitive customer satisfaction
- fuel expense and maintenance risk
- reviews and reputation
- wildlife events
- daily revenue/expense/net results
- company valuation and ledger
- device-local owner-test save/reload
- demo-mode design
- Cloudflare D1 account, session, company sync and leaderboard foundation
- separate marketing-email opt-in

Core gameplay does not use AI or external APIs.

## Stack

- TypeScript
- React
- Vite
- Cloudflare Workers
- Cloudflare D1

## Run locally

```bash
npm install
npm run dev
```

## Competition

Registered companies can compete by:
- company value
- lifetime revenue
- lifetime profit
- most reviews
- best rating (10-review minimum)

Demo and owner-test saves are excluded from public ranking until intentionally synced.

## Development rule

Owner testing remains login-free until Gold. Public players may try Day 1 in demo mode without creating an account.


## Deployment

Production deploys are handled by GitHub Actions using Cloudflare Workers and D1. Required repository secrets:

- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_API_TOKEN
