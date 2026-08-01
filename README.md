# Smart Scheduler

A course scheduler for Virginia Tech students that goes beyond time slots:
it shows walking distances between class buildings on an interactive campus
map, evaluates schedule feasibility, and lets students add personal
commitments (clubs, workouts, meals) to test how a schedule actually fits
into their day.

Built in under 8 hours at the AWS Kiro x CS Careers Hackathon 2026 at
Virginia Tech. Team of 2–3 —
[Devpost submission](https://devpost.com/software/smart-scheduler-5fhw7b).

## What it does

- **Class-aware map** — see walking distances between class buildings on
  an interactive Leaflet.js campus map
- **Schedule feasibility** — flags tight transitions and unrealistic gaps
- **Personal commitments** — add clubs, workouts, meals to a schedule and
  see how it all fits together
- **Google sign-in** — save your schedule to DynamoDB

## Tech stack

- **Frontend:** Next.js (TypeScript, App Router), Tailwind CSS, Leaflet.js
- **Backend:** Express.js (Node) for routing, Flask (Python) for VT class
  data processing
- **Storage & auth:** AWS DynamoDB, Google OAuth
- **Built with:** AWS Kiro (agentic IDE) — an experiment in AI-assisted
  development

## How to run

Prereqs: Node.js 20+, Python 3.10+, an AWS account (for DynamoDB), a
Google OAuth client.

**1. Clone**

```bash
git clone https://github.com/eelizabethho/vt-aws.git
cd vt-aws
```

**2. Install dependencies**

Next.js frontend (repo root):

```bash
npm install
```

Express server:

```bash
cd server
npm install
cd ..
```

Flask backend:

```bash
cd backend
pip install -r requirements.txt
cd ..
```

**3. Environment variables**

Create a `.env.local` at the repo root:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_ID=your_google_client_id
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

**4. Run**

Three terminals:

```bash
# Terminal 1 — Flask (VT class data)
cd backend && python app.py

# Terminal 2 — Express (routing + DynamoDB)
cd server && node index.js

# Terminal 3 — Next.js frontend
npm run dev
```

Open <http://localhost:3000>.
