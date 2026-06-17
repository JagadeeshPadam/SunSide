<div align="center">

# ☀️ SunSide

### Solar Exposure Optimizer for Travelers

**Determine which side of the vehicle to sit on to minimize direct sunlight exposure — using route geometry, real solar physics, and live weather data.**

[![CI](https://github.com/yourusername/sunside/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/sunside/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Architecture](#-architecture)
4. [Folder Structure](#-folder-structure)
5. [Installation](#-installation)
6. [Environment Variables](#-environment-variables)
7. [Running Locally](#-running-locally)
8. [Testing](#-testing)
9. [Deployment](#-deployment)
10. [CI/CD Setup](#-cicd-setup)
11. [API Setup Instructions](#-api-setup-instructions)
12. [Troubleshooting](#-troubleshooting)
13. [Future Improvements](#-future-improvements)

---

## 🌟 Project Overview

SunSide is a **production-grade full-stack web application** that helps travelers decide which side of a vehicle (left or right) to sit on during a journey to minimize direct sunlight exposure.

It is **not an AI application**. Every recommendation is derived from:
- **Route geometry** — real GPS coordinates from OpenRouteService
- **Solar physics** — sun azimuth and altitude calculated by SunCalc
- **Weather data** — cloud coverage from OpenWeatherMap that modulates exposure
- **Vehicle heading** — bearing between consecutive route points

The result is a per-segment seating recommendation timeline, an exposure score, and an interactive map overlay.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ Route Analysis | Fetches real driving/cycling/walking routes and splits them into ~5-minute segments |
| ☀️ Solar Positioning | Calculates sun azimuth & altitude at every segment's location and time using SunCalc |
| 💺 Seat Recommendations | Tells you Left / Right / Front / Rear with exact time windows |
| 🌤️ Weather Integration | Cloud coverage reduces exposure score; night = zero exposure |
| 🚗 Vehicle Types | Car, Bus, Train, Bike — each with a unique animated seat diagram |
| ⏰ Departure Optimizer | Tests departure times at 15-minute intervals and recommends the one with least sun |
| 🗺️ Interactive Map | Leaflet + OpenStreetMap route overlay colored Green/Yellow/Red by exposure intensity — 100% free, no API key |
| 📊 Exposure Chart | Recharts area chart of exposure score over journey time |
| 🌙 Dark / Light Mode | Persisted to localStorage, respects system preference on first visit |
| 📱 Fully Responsive | Works at 320px mobile width through 4K desktop |
| ⚡ Fast & Accessible | Server-side rendered shell, client hydration, keyboard-navigable |

---

## 🏗️ Architecture

```
Browser (Next.js 15 App Router)
         │
         ├─ /app/page.tsx          ← Main orchestration (state machine)
         ├─ /app/providers.tsx     ← React Query provider
         │
         ├─ Components
         │   ├─ JourneyForm        ← Location inputs, vehicle selector, form
         │   ├─ ResultsDashboard   ← Aggregates all result panels
         │   ├─ RouteMap           ← Mapbox GL JS interactive map
         │   ├─ SeatingTimeline    ← Time-windowed seat recommendations
         │   ├─ SeatDiagram        ← SVG vehicle cross-section per type
         │   ├─ ExposureChart      ← Recharts area chart
         │   ├─ JourneySummary     ← Distance, duration, scores
         │   ├─ WeatherSummary     ← Cloud cover, temperature, UV
         │   └─ DepartureOptimizer ← Best departure time comparison
         │
         └─ API Routes (Next.js)
              ├─ POST /api/analyze   ← Full journey analysis
              ├─ POST /api/optimize  ← Departure time optimization
              └─ GET  /api/geocode   ← Location autocomplete

External APIs
  ├─ OpenRouteService  → Geocoding + Directions
  ├─ OpenWeatherMap    → Weather data (optional, falls back to mock)
  └─ SunCalc (npm)     → Solar position (runs server-side, no key needed)
```

---

## 📁 Folder Structure

```
sunside/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # POST — full route analysis
│   │   ├── geocode/route.ts      # GET  — location search
│   │   └── optimize/route.ts     # POST — departure optimization
│   ├── globals.css               # Global styles, CSS variables, animations
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main app page (state machine)
│   └── providers.tsx             # React Query client provider
│
├── components/
│   ├── ui/                       # Primitive UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── skeleton.tsx
│   ├── DepartureOptimizer.tsx
│   ├── ErrorState.tsx
│   ├── ExposureChart.tsx
│   ├── JourneyForm.tsx
│   ├── JourneySummary.tsx
│   ├── LoadingState.tsx
│   ├── LocationInput.tsx
│   ├── ResultsDashboard.tsx
│   ├── RouteMap.tsx
│   ├── SeatDiagram.tsx
│   ├── SeatingTimeline.tsx
│   ├── ThemeToggle.tsx
│   ├── VehicleSelector.tsx
│   └── WeatherSummary.tsx
│
├── hooks/
│   ├── useAnalysis.ts            # React Query mutations for API calls
│   └── useTheme.ts               # Dark/light mode with localStorage
│
├── lib/
│   ├── analysis.ts               # Main orchestrator — calls all services
│   ├── recommendations.ts        # Recommendation grouping & scoring
│   ├── route.ts                  # Haversine, heading, route segmentation
│   ├── solar.ts                  # SunCalc wrapper, exposure side logic
│   └── utils.ts                  # cn(), formatTime, colors, labels
│
├── services/
│   ├── openroute.ts              # OpenRouteService API client
│   └── weather.ts                # OpenWeatherMap API client
│
├── types/
│   └── index.ts                  # All TypeScript interfaces & types
│
├── __tests__/
│   ├── recommendations.test.ts
│   ├── route.test.ts
│   └── solar.test.ts
│
├── .github/
│   └── workflows/
│       └── ci.yml                # Lint → Type check → Test → Build
│
├── .env.example                  # Template for required env vars
├── jest.config.js
├── jest.setup.js
├── next.config.ts
├── vercel.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18.17+ (LTS recommended)
- **npm** 9+
- A free **OpenRouteService** API key
- (Optional) A free **OpenWeatherMap** API key
- (Optional) A free **Mapbox** access token

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/sunside.git
cd sunside

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Then edit .env.local and fill in your API keys

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Required | Description |
|---|---|---|
| `OPENROUTESERVICE_API_KEY` | **Yes** | Used for geocoding and routing. Free tier is sufficient. |
| `OPENWEATHERMAP_API_KEY` | No | Cloud coverage & weather. Falls back to mock data if missing. |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | Interactive route map. Shows placeholder if missing. |
| `NEXT_PUBLIC_APP_URL` | No | Public URL for Open Graph tags. Defaults to localhost. |

> **Security note:** Only `NEXT_PUBLIC_*` variables are exposed to the browser. The ORS and OWM keys are server-side only — they never reach the client.

---

## 💻 Running Locally

```bash
# Development (hot reload)
npm run dev

# Production build (test before deploy)
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### What is tested

| Test file | Coverage |
|---|---|
| `__tests__/solar.test.ts` | `getSolarPosition`, `getSunExposureSide` (all quadrants + night), `calculateExposureScore` |
| `__tests__/route.test.ts` | `calculateHeading` (N/S/E/W + real-world), `calculateDistance` (Haversine), `segmentRoute` |
| `__tests__/recommendations.test.ts` | Grouping, 15-min merge window, `formatDuration`, `formatDistance` |

---

## 🚢 Deployment

### Vercel (recommended)

1. Push the repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add environment variables in the Vercel dashboard:
   - `OPENROUTESERVICE_API_KEY`
   - `OPENWEATHERMAP_API_KEY`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
4. Click **Deploy**

Every push to `main` automatically triggers a Vercel deployment via the GitHub integration.

The `vercel.json` file is pre-configured with:
- No-cache headers on API routes
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Region: `iad1` (US East — change as needed)

---

## ⚙️ CI/CD Setup

The `.github/workflows/ci.yml` pipeline runs on every push to `main` and every PR:

```
Install → Lint → Type Check → Test → Build
```

To add your API keys as GitHub Secrets:
1. Go to **Settings → Secrets and variables → Actions**
2. Add: `OPENROUTESERVICE_API_KEY`, `OPENWEATHERMAP_API_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN`

The build step uses these secrets so the production build succeeds in CI.

---

## 🔌 API Setup Instructions

### OpenRouteService (required)

1. Sign up at [openrouteservice.org](https://openrouteservice.org/dev/#/signup)
2. Go to your dashboard → **Tokens** → copy the default token
3. Free tier: 2,000 requests/day, 40 requests/minute — more than enough

### OpenWeatherMap (optional)

1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Go to **API keys** in your account → copy the default key
3. Free tier: 1,000 calls/day — sufficient for development
4. **Without this key:** the app uses mock weather data (50% cloud cover, temperature derived from latitude)

### Mapbox (optional)

1. Sign up at [mapbox.com](https://account.mapbox.com/)
2. Go to **Access tokens** → copy the default public token (starts with `pk.`)
3. Free tier: 50,000 map loads/month
4. **Without this token:** a styled placeholder with route stats is shown instead of the map

---

## 🐛 Troubleshooting

### "Route not found"
- Ensure source and destination are on the road network (not in the middle of the ocean)
- Try more specific location names (city + country)

### "API key missing or invalid"
- Double-check `.env.local` — note no quotes around values
- Restart the dev server after changing env vars (`Ctrl+C` then `npm run dev`)
- ORS keys can take a few minutes to activate after creation

### Map shows placeholder instead of route
- Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local`
- Ensure the token starts with `pk.` (it's a public token, not a secret token)

### Tests fail with "Cannot find module suncalc"
```bash
npm install
```

### TypeScript errors on build
```bash
npm run type-check
```
This shows the exact errors. All types are strict — no `any` allowed.

### Build fails in CI but works locally
- Check that all `NEXT_PUBLIC_*` vars are set as GitHub Secrets
- The build needs `NEXT_PUBLIC_MAPBOX_TOKEN` even if it's unused at runtime (Next.js replaces it at build time)

---

## 🔮 Future Improvements

- **Train-specific routing** — integrate a rail API (DB, Trainline) for accurate train route geometry
- **UV Index timeline** — show UV index alongside exposure score per segment
- **Seat map integration** — link to airline/train seat picker with pre-selected optimal seat
- **Offline support** — cache last result with service worker for poor connectivity
- **Trip history** — save and compare past journeys (localStorage or Supabase)
- **Share card** — generate a shareable image (OG image) of journey recommendations
- **Browser extension** — detect travel bookings and auto-analyze routes
- **Multi-stop journeys** — support routes with intermediate stops
- **Elevation data** — account for hills/tunnels that block sunlight

---

<div align="center">

Built with ❤️ using Next.js, TypeScript, SunCalc, and real solar physics.

**No AI. Just math.**

</div>
