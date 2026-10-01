# Architecture

## Simulation
Pure TypeScript. Seeded random generator makes day results reproducible and testable.

## Client
React + Vite. Mobile portrait is the primary layout.

## Persistence
Owner-test and demo state start local. Registered-player state syncs to Cloudflare D1.

## Competition
Players do not directly play against each other. Rankings are aggregated from registered company state.

## Cost discipline
- no AI in the gameplay loop
- no live weather API required
- no constant polling
- static content bundled client-side
- D1 only for accounts, synced company state and leaderboards
- compact leaderboard queries with indexes
