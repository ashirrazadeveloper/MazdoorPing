# MazdoorPing - Pakistan's Premier Worker Platform

A full-stack Next.js 16 application connecting skilled workers with employers. Built with TypeScript, Tailwind CSS 4, and Supabase.

## Features

### Worker Section (Green Theme)
- **Dashboard** - Overview stats, recent jobs, verification status
- **Browse Jobs** - Search & filter open jobs by category, city, urgency
- **My Jobs** - Track active, completed, and cancelled job bids
- **Wallet** - Balance, earnings, withdrawal system
- **Profile** - Edit profile, manage skills, verification status
- **Reviews** - View received ratings and reviews
- **SOS Alert** - Emergency safety feature with GPS
- **Notifications** - Real-time alerts

### Employer Section (Blue Theme)
- **Dashboard** - Posted jobs stats, recent bids received
- **Post Job** - Create new job listings with budget & requirements
- **Find Workers** - Search verified workers by skill, city, rating
- **My Bookings** - Manage active jobs, accept/reject bids
- **Profile** - Company details and statistics
- **Notifications** - Real-time alerts
- **Favorites** - Save preferred workers

### Admin Section (Orange Theme - Hidden)
- **Dashboard** - Platform-wide stats and analytics
- **Workers** - Verification approve/reject, management
- **Employers** - View and manage employers
- **Jobs** - Moderate job listings
- **Categories** - Manage job categories
- **Financials** - Revenue, transactions, withdrawals
- **SOS Alerts** - Emergency response management
- **Settings** - Platform configuration

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + Glassmorphism Dark Theme
- **Backend:** Supabase (Auth, Database, Realtime)
- **State:** Zustand
- **Charts:** Recharts
- **Maps:** Leaflet / React-Leaflet
- **Icons:** Lucide React

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and add Supabase credentials
4. Run the SQL schema from `/shared/schema.sql` in Supabase SQL Editor
5. Start development: `npm run dev`

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema
See `/shared/schema.sql` for the complete Supabase database schema with:
- 15 tables with full RLS policies
- Row Level Security for all tables
- Indexes for performance
- Auto-trigger for profile creation on signup
- Updated_at automatic triggers

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login
│   ├── register/page.tsx     # Register with role selection
│   ├── worker/               # 8 Worker pages
│   ├── employer/             # 7 Employer pages
│   └── admin/                # 9 Admin pages
├── components/
│   ├── layouts/              # Sidebar, BottomNav, SectionLayout
│   └── shared/               # StatCard, JobCard, WorkerCard, etc.
├── lib/                      # Supabase clients, utils
├── store/                    # Zustand auth store
├── types/                    # TypeScript interfaces
└── middleware.ts             # Auth protection
```

## License
Private - All rights reserved.
