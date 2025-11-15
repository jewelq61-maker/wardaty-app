# Wardiya Bloom Cycle - AI Agent Instructions

## Project Overview

Wardiya (وردتي) is a bilingual (Arabic/English) women's wellness and menstrual cycle tracking app built with React, TypeScript, Vite, and Supabase. The app targets multiple personas (single, married, mother, partner) with specialized features for Islamic practices, beauty planning, and cycle synchronization.

## Architecture

### Tech Stack
- **Frontend**: React 18.3 + TypeScript + Vite + SWC
- **UI**: shadcn/ui (Radix UI primitives) + Tailwind CSS
- **Routing**: React Router v6
- **State**: React Context API for auth, i18n, and theme
- **Data**: TanStack Query v5 + custom `useCachedQuery` hook
- **Database**: SQLite (better-sqlite3) + Drizzle ORM
- **Auth**: Local authentication with bcryptjs password hashing
- **Mobile**: Capacitor 7 for iOS/Android builds
- **PWA**: vite-plugin-pwa with workbox

### Key Directories
- `src/pages/` - Top-level routes with onboarding, home, calendar, stats, beauty planner
- `src/components/` - Reusable widgets (mood tracker, cycle predictions, beauty recommendations)
- `src/contexts/` - AuthContext, I18nContext, ThemeContext
- `src/db/` - Database schema, client, and seed scripts
- `src/services/` - Authentication service layer
- `src/utils/` - Beauty calculations (cycle phases, moon phases, Hijri calendar)
- `supabase/` - Legacy Supabase configuration (deprecated, being phased out)

## Critical Patterns

### 1. Cycle Phase Calculation
The app uses a **standardized 4-phase cycle model** replicated across components:
```typescript
// Standard phase logic (28-day cycle with 5-day period)
if (dayInCycle < periodDuration) phase = 'menstrual';
else if (dayInCycle >= periodDuration && dayInCycle < 14) phase = 'follicular';
else if (dayInCycle >= 14 && dayInCycle < 16) phase = 'ovulation';
else phase = 'luteal';
```
**When modifying**: Update `Home.tsx`, `BeautyPlanner.tsx`, `Calendar.tsx`, and `supabase/functions/beauty-recommendations/index.ts` in parallel to maintain consistency.

### 2. Bilingual i18n
- All text uses `react-i18next` with `useTranslation()` hook
- Translation keys live in `src/lib/i18n.ts` (NOT external JSON files)
- Arabic is the default language with RTL support via `I18nContext`
- **Pattern**: Always add translations for both `ar` and `en` when adding new UI text

### 3. Local Database Flow
- **Client**: `src/db/client.ts` - SQLite database with better-sqlite3
- **Schema**: `src/db/schema.ts` - Drizzle ORM table definitions (7 tables: profiles, cycles, cycle_days, beauty_actions, fasting_entries, daughters, share_links)
- **Types**: Inferred from Drizzle schema using `typeof table.$inferInsert` and `typeof table.$inferSelect`
- **Queries**: Direct Drizzle ORM queries with `.get()`, `.all()`, `.run()` methods
- **Auth**: `src/services/auth.ts` - Local authentication with bcryptjs, localStorage session persistence
- **AuthContext**: Exposes `user`, `session`, `loading`, `logout()` via `useAuth()` hook
- **Protected Routes**: Wrapped in `<ProtectedRoute>` component in `App.tsx`
- **Database File**: `wardiya.db` in project root (gitignored)

**Pattern for queries**:
```typescript
import { db } from '@/db/client';
import { profiles, cycles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// SELECT
const user = db.select().from(profiles).where(eq(profiles.id, userId)).get();

// INSERT
db.insert(cycles).values({ id: crypto.randomUUID(), userId, startDate: '2025-01-01', length: 28 }).run();

// UPDATE
db.update(profiles).set({ name: 'New Name' }).where(eq(profiles.id, userId)).run();

// DELETE
db.delete(cycles).where(eq(cycles.userId, userId)).run();
```

### 4. Beauty Recommendations System
**Core logic in `src/utils/beautyCalculations.ts`**:
- Calculates optimal timing for 12 beauty categories based on:
  - Menstrual cycle phase (menstrual/follicular/ovulation/luteal)
  - Moon phase (new/first-quarter/full/last-quarter)
  - Hijri calendar days (17, 19, 21 for hijama)
  - User goals (faster-growth, thicker, reduce-volume, maintain)
- Returns 0-100 score with reasoning and warnings
- **When adding beauty categories**: Update `BeautyCategory` type and score matrices in `getCyclePhaseScore()` and `getMoonPhaseScore()`

### 5. Mobile-First Responsive Design
- `useIsMobile()` hook detects <768px breakpoint
- Bottom navigation (`BottomNav.tsx`) replaces sidebar on mobile
- Capacitor config in `capacitor.config.ts` for native builds
- **Pattern**: Test layouts at 375px (mobile) and 1024px (desktop)

## Development Workflows

### Running the App
```bash
npm run dev              # Start dev server on :8080
npm run build            # Production build to dist/
npm run preview          # Preview production build
```

### Database Management
```bash
npm run db:seed          # Seed database with test user (a@domo.com / $123456$)
npm run db:init          # Initialize database schema
```

**Test Credentials**:
- Email: `a@domo.com`
- Password: `$123456$`

### Legacy Supabase (Deprecated)
The project originally used Supabase but has been migrated to local SQLite. Supabase configurations remain for reference but are not actively used.

### Mobile Builds
```bash
npm run build            # Build web assets first
npx cap sync             # Sync to iOS/Android
npx cap open ios         # Open Xcode
npx cap open android     # Open Android Studio
```

### Database Migrations
- Migrations in `supabase/migrations/` (timestamped SQL files)
- Apply locally with `npx supabase db reset`
- Push to prod with `npx supabase db push`

## Component Conventions

### Widget Components
Stateful widgets like `MoodTrackerWidget`, `SymptomTrackerWidget` follow this pattern:
1. Fetch user data with `useCachedQuery` or direct Drizzle query
2. Display loading skeleton while `loading === true`
3. Show empty state if no data
4. Render interactive UI with optimistic updates
5. Use `toast()` from `use-toast` hook for success/error feedback

### Form Handling
- Forms use `react-hook-form` with `zod` validation (via `@hookform/resolvers`)
- Example in `src/pages/Onboarding/CycleSetup.tsx`
- Validation schemas in `src/lib/validation.ts`

### Styling
- Tailwind utility classes (no CSS modules)
- Custom colors in `tailwind.config.ts`: `period`, `ovulation`, `info`, `warning`
- Glass morphism cards: `.glass-card` class
- RTL-aware spacing: Use `ms-*` (margin-start) instead of `ml-*`

## Edge Function Patterns

Functions in `supabase/functions/` use Deno runtime:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Function logic here
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Key Functions
- `beauty-recommendations` - AI-powered beauty advice using OpenAI
- `daily-insights` - Daily personalized insights based on cycle phase
- `send-beauty-reminders` - Scheduled reminders for beauty actions

## Testing & Debugging

### Browser DevTools
- Check Network tab for Supabase API calls (look for `rest.supabase.co`)
- Use React DevTools to inspect Context values
- Console errors often show Supabase RLS (Row Level Security) violations

### Common Issues
1. **"No rows returned"**: Check RLS policies in Supabase dashboard
2. **Type errors in queries**: Regenerate types with `npx supabase gen types`
3. **Auth issues**: Clear localStorage and re-login
4. **Stale cache**: Use `invalidate()` from `useCachedQuery` return value

## Database Schema Highlights

Key tables:
- `profiles` - User profile with `persona` (single/married/mother/partner)
- `cycles` - Menstrual cycle records (start_date, length, duration)
- `cycle_days` - Daily logs (mood, symptoms, flow, notes)
- `beauty_actions` - Scheduled beauty treatments with phase and completion status
- `fasting_entries` - Qada fasting tracking for Muslim users
- `daughters` - Mother persona tracks daughters' cycles
- `share_links` - Partner sharing with cycle synchronization

## Conventions to Follow

1. **Always use database client from `@/db/client`** - Never create new instances
2. **Path aliases**: Use `@/` for `src/` imports (configured in vite.config.ts)
3. **Date handling**: Use `date-fns` functions, not raw Date() manipulation
4. **Error handling**: Log to console + show toast notification
5. **Loading states**: Always show skeleton/spinner during async operations
6. **TypeScript**: Avoid `any` types - use Drizzle-inferred types from schema

## When Adding New Features

1. **UI Components**: Check if similar component exists in `src/components/ui/` (shadcn)
2. **New routes**: Add to `App.tsx` routes array + update `BottomNav.tsx` if needed
3. **Database changes**: Update schema in `src/db/schema.ts` and re-run seed
4. **Translations**: Update BOTH `ar` and `en` objects in `src/lib/i18n.ts`

## Performance Notes

- `useCachedQuery` reduces API calls - default 5min cache
- Images should use WebP format, stored locally or in CDN
- Capacitor splash screen config in `capacitor.config.ts`
- PWA caches static assets via workbox

## Islamic Features

The app includes specialized features for Muslim users:
- **Fasting Qada**: Tracks missed Ramadan fasting days during menstruation
- **Hijri Calendar**: Beauty recommendations consider Hijri dates (17, 19, 21 for hijama)
- **Prayer Impact**: Moon phases align with Islamic lunar calendar
- See `src/utils/hijri.ts` and `FastingQadaWidget.tsx`
