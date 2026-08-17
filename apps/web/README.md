# FundrHub Web

FundrHub web client — a Next.js application for the Founder ↔ Investor Discovery, Matching & Connection Platform.

## Features

- **Landing page** with 3D tilt animations, animated hero, featured startups/investors, and CTA sections
- **Authentication** — register (founder/investor roles), login, logout
- **Role-based dashboards** for founders and investors with KPIs and quick actions
- **Startup discovery** — search, filter by sector/stage, view detailed profiles
- **Investor discovery** — search, filter by sector/type, view detailed profiles
- **Explainable matching** — match scores with breakdown of sector, stage, ticket size, and geography factors
- **Connection requests** — send, accept, reject, withdraw requests
- **Private messaging** — conversation list and chat interface
- **Shortlisting** — save startups/investors for later
- **Notifications** — action center with unread counts and mark-as-read
- **Profile management** — edit founder profile information
- **Startup creation** — 3-step guided form for startup details and fundraising
- **Contact page** — with founder contact details (Ashutosh Singh, +91 70425 79843, Singhashu772@gmail.com)
- **Coming Soon page** — animated countdown timer with email notification signup

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS with design tokens
- **Animations:** Framer Motion (3D tilt cards, scroll animations, animated blobs)
- **Icons:** Lucide React
- **State:** React Context (auth + toast)

## Getting Started

```bash
# Install dependencies from repo root
npm install

# Run the dev server (port 7070)
npm run dev:web
# or
cd apps/web && npm run dev
```

Open [http://localhost:7070](http://localhost:7070) in your browser.

## Demo Credentials

The app uses mock data — any email/password works for login:

- Use `founder@fundrhub.com` (or any non-investor email) for **founder** view
- Use `investor@fundrhub.com` for **investor** view

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── login/        # Login page
│   ├── register/     # Registration page
│   ├── dashboard/    # Role-based dashboard
│   ├── startups/     # Startup discovery & creation
│   ├── investors/    # Investor discovery
│   ├── matches/      # Explainable matching
│   ├── connections/  # Connection requests
│   ├── messages/     # Private messaging
│   ├── notifications/# Notification center
│   ├── profile/      # User profile
│   ├── shortlist/    # Saved items
│   ├── contact/      # Contact page with founder details
│   └── coming-soon/  # Coming soon with countdown
├── components/       # UI components
│   ├── layout/       # Navbar, footer
│   └── ui/           # Button, input, card, badge, modal, toast, avatar
├── context/          # Auth context provider
└── lib/              # Types, enums, mock data, utilities