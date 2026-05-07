---
Task ID: 2
Agent: Main Agent
Task: Fix tablet responsiveness, Urdu translations for chat/availability, AI assistant, income analytics default data

Work Log:
- Fixed EN availability translation keys from monday/tuesday to mon/tue/wed matching code DAY_KEYS
- Added 50+ missing Urdu translations for chat tab (ur.chat section was completely absent)
- Expanded Urdu availability section from 2 keys to 30+ keys
- Added missing EN availability keys (workerAvailability, availableDays, daysThisWeek, etc.)
- Rewrote Income Analytics page to fetch real data from Supabase instead of hardcoded mock data
- Analytics now shows empty state with descriptive message for users with no completed jobs
- Fixed AI Chat API route: added force-dynamic export, SDK instance caching, better error handling
- Fixed BottomNav dynamic Tailwind classes issue (text-${accentColor}-400 not JIT-analyzable)
- Added tablet responsive CSS (768-1024px breakpoint): sidebar width, text sizing, grid gaps
- Added tablet Urdu font adjustments
- Fixed BarChart name collision between lucide-react and recharts imports
- Build succeeded (53 pages, 0 errors)
- Pushed to GitHub: main (commit 74b05db)
- Vercel deployment: READY

Stage Summary:
- Messages tab now fully translates to Urdu when language toggle is switched
- Availability tab content now fully translates to Urdu (all day names, labels, buttons)
- Income Analytics no longer shows fake default data - loads from Supabase or shows empty state
- AI Assistant API route improved with SDK caching and better error handling for Vercel
- Tablet responsiveness improved with dedicated CSS breakpoints
- BottomNav active colors now properly applied
- Deployed: https://mazdoorping.vercel.app
