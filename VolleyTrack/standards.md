# VolleyTrack Standards

## 1. Purpose
This document defines coding and data standards for the VolleyTrack project, ensuring consistency, reliability, and accurate match tracking.

## 2. Coding Standards
- **React Components:** Use functional components with hooks (`useState`, `useEffect`).
- **File Naming:** PascalCase for components and pages (`LiveMatch.jsx`).
- **State Management:** Keep match and player states local when possible; pass through React Router state when navigating.
- **API Calls:** Use `fetch` with proper error handling and `async/await`.

## 3. Backend Standards
- **Express Endpoints:** Follow REST principles.
  - `POST /teams` → Create new team
  - `GET /teams` → Get all teams
  - `POST /teams/:teamId/players` → Add player
  - `GET /teams/:teamId/players` → List players
  - `POST /matches` → Save match data
- **MongoDB:** 
  - Collections: `teams`, `matches`
  - Use `_id` as unique identifier for teams and matches.
  - Store `players` array inside each team document.

## 4. Player & Team Data
- **Team:**
  - `_id` (Mongo ObjectId)
  - `coachName` (string)
  - `teamName` (string)
  - `players` (array)
  - `createdAt` (date)
- **Player:**
  - `number` (string or number)
  - `position` (RS, OH, L, S, M)
  - `isPlaying` (boolean)
  - `stats` (object for historical stats)

## 5. Match Data
- **Match Document:**
  - `_id`
  - `teamId`
  - `teamName`
  - `players` (array with stats: points, attacks, tips, errors)
  - `opponentZones` (object: 1–6)
  - `ballDrops` (array of `{x, y, id}`)
  - `createdAt`
- **Player stats tracking:**
  - Count points, attacks, tips, errors
  - Track timestamps for action intervals

## 6. Match Duration & Timing
- Record `matchStartTime` using `Date.now()`.
- Compute total duration when the analysis view is requested.
- Record intervals between player scoring actions to calculate average times.

## 7. Analysis & Reporting
- **Top Scorers:** Based on `points + attacks + tips`
- **Errors:** Only players with at least 1 error
- **Opponent Zones:** Only include zones with scores > 0
- **Ball Drops:** Generate court heatmap using `(x, y)` coordinates and density overlay
- **Player Timing:** Calculate average time between scoring actions; exclude players with no intervals

## 8. Filtering & Data Views
- Users can filter analysis by:
  - All players
  - Only players currently playing (`isPlaying === true`)
  - By position (RS, OH, L, S, M)
- Filters apply to charts and player lists for targeted insights.

## 9. Pitfalls & Cautions
- **Incomplete Data:** Missing intervals for some players.
- **Manual Input Errors:** Mis-clicks may produce inaccurate stats.
- **Sampling Bias:** Active players appear to perform better due to more actions recorded.
- **Small Sample Size:** Short matches may not reflect overall performance accurately.
- **Data Integrity:** Always validate player numbers and positions before saving.

## 10. Best Practices
- Reset stats and timers at match start.
- Clear previous ball drops when starting a new match.
- Combine quantitative stats with qualitative observations (playing context, match phase).
- Use filters carefully to avoid misinterpretation of partial data.
- Regularly test API endpoints for consistency and error handling.

## 11. Learnings from Data Analysis
- Data may be faulty if actions are missed or misrecorded.
- Player performance is context-dependent; statistics alone may not tell the full story.
- Action intervals provide insights into pacing but are only meaningful if all actions are tracked.
- Visualizations like heatmaps and zone charts help identify trends but should be interpreted cautiously.
