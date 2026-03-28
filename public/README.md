# SmartScheduler — Virginia Tech

A schedule optimization tool for Hokies. Select your courses and SmartScheduler automatically finds the best section combination that **minimizes walking distance** between buildings on the VT campus — with zero time conflicts.

## Features

- **Smart Optimization** — Brute-force evaluates every possible section combination to find the optimal schedule
- **Walking Distance Calculator** — Uses Haversine formula with real VT building GPS coordinates to compute distances
- **Interactive Campus Map** — Leaflet-powered dark-themed map with numbered markers and a dashed walking route
- **Conflict Detection** — Automatically rejects schedules with overlapping class times
- **Walking Route View** — Step-by-step breakdown of walks between consecutive classes with time estimates
- **12 Real VT Courses** — CS, MATH, PHYS, ENGL, ECE, ENGE, BIT, ACIS, ISE with multiple sections each
- **15 Campus Buildings** — Torgersen, McBryde, Derring, Hahn, Robeson, Whittemore, Goodwin, and more

## Tech Stack

- **React 19** — UI framework
- **Tailwind CSS 3** — Utility-first styling with VT maroon/orange color palette
- **Leaflet** — Interactive OpenStreetMap-based campus map
- **Lucide React** — Icon library
- **Haversine Formula** — Accurate distance calculations between buildings

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app runs at `http://localhost:3000`.

## How It Works

1. **Select courses** from the searchable catalog
2. Click **Optimize Schedule** — the engine tests all section permutations
3. View your optimized schedule with **walking distances and times** between classes
4. Explore the **interactive campus map** showing your route across the Drillfield

## Project Structure

```
src/
├── App.js        # Main application (course data, optimizer, UI)
├── index.js      # React entry point
└── index.css     # Tailwind directives + custom animations
```

## CS 3704 Group Project — Virginia Tech

Built with React, Tailwind CSS & Leaflet.
