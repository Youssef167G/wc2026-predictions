# 🏆 WC2026 Group Stage Predictions

FIFA World Cup 2026 group-stage prediction app for you and your friends on the same network.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite via better-sqlite3 (single file, zero config)

## Quick Start

```bash
# 1. Install all dependencies (run once)
npm run install:all

# 2. Start both servers
npm run dev
```

Then open **http://localhost:5173** in your browser.

## LAN / Friend access

```bash
npm start   # adds --host flag to Vite
```

Your friends on the same WiFi can visit `http://<your-ip>:5173`.  
Find your IP with: `ip addr show | grep "inet "` (Linux) or `ipconfig` (Windows).

## How It Works

1. **Enter your name** on the landing page
2. **Rank all 4 teams** in each of the 12 groups by dragging (desktop) or using ▲▼ buttons (mobile)
3. **Mark best 3rd-place qualifiers** — up to 8 across all groups
4. **Confirm each group**, then hit **Save**
5. **View everyone's predictions** from the predictions page

## Qualification Rules

| Position | Status |
|----------|--------|
| 1st & 2nd in every group | Auto-qualify (24 teams) |
| Best 8 of 12 third-place | Qualify (8 teams) |
| **Total** | **32 teams → Round of 32** |

## Ports
| Service  | Port |
|----------|------|
| Frontend | 5173 |
| Backend  | 3001 |

## Project Structure
```
wc2026-predictions/
├── backend/
│   ├── server.js         Express API
│   ├── db.js             SQLite setup
│   └── predictions.db    Auto-created on first run
├── frontend/
│   └── src/
│       ├── pages/        LandingPage, PredictionForm, ViewPredictions
│       ├── components/   GroupCard, UserPredictionView
│       └── data/         groups.js  (teams + flags)
└── package.json          Root scripts (concurrently)
```
