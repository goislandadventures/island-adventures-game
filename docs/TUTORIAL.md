# Week 1 Captain School

The first seven operating days are the game's brief but complete onboarding period.

## Product rule

Any new player-facing system that materially changes how the business is operated must update `src/game/data/tutorial.ts`.

Do not create a second tutorial system. Extend the Week 1 lessons in the earliest logical day, or replace a less-important lesson if the daily tutorial becomes too long.

The tutorial must remain:
- brief enough to scan on a phone
- complete enough to explain every core system
- contextual to the day the player first needs the concept
- optional to collapse/dismiss
- free of long modal walkthroughs or forced tapping

## Current progression

Day 1 — startup, boat/slip/insurance, weather, per-trip captain decisions  
Day 2 — pricing and demand  
Day 3 — fuel, condition, maintenance, cash reserve  
Day 4 — booking sources and acquisition concepts  
Day 5 — books, profit, and company value  
Day 6 — reputation, reviews, and leaderboards  
Day 7 — independent operation and tutorial graduation

When future systems such as staffing, financing, marketing controls, island expansion, or additional fleet management become playable, this file and `tutorial.ts` must be updated in the same change.
