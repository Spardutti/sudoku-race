# Story 4.7: Global All-Time Leaderboard (Personal Best)

Status: ready-for-dev

## Story

As a **recurring player**,
I want **to see a global all-time leaderboard showing each user's personal best time across all puzzles**,
so that **I feel connected to the competitive community even when nobody has played today's puzzle yet and I can aspire to beat the top players' best times**.

## Acceptance Criteria

1. **Dual Tab Interface on Leaderboard Page**
   - Leaderboard page displays two tabs: "Today's Puzzle" and "All-Time Best"
   - Default tab is "Today's Puzzle" (preserves existing behavior)
   - Tab navigation is clear, responsive, and accessible
   - Active tab is visually distinct with newspaper aesthetic styling
   - Tab selection persists on page refresh (localStorage)

2. **All-Time Best Leaderboard Data**
   - Shows top 100 players ranked by their personal best completion time (fastest time ever recorded)
   - One entry per user (not one per puzzle)
   - Query selects minimum `completion_time_seconds` from `leaderboards` table grouped by `user_id`
   - Displays: rank (#1, #2, ...), username, personal best time (MM:SS format)
   - Sorted by completion time (fastest first)
   - Ties broken by earliest achievement date (`submitted_at` of that best completion)

3. **Personal All-Time Rank**
   - Auth users see their personal rank highlighted (even if outside top 100)
   - If outside top 100: sticky footer shows "Your All-Time Best: #347 - Time: 18:45"
   - Personal rank calculated from user's minimum completion time across all puzzles
   - Guest users see auth prompt: "Sign in to see your all-time rank!"

4. **Empty State Handling**
   - If no completions exist yet: "Be the first to set a record time!"
   - If user has no completions: Personal rank section shows "Complete a puzzle to set your personal best!"

5. **UI Polish & Consistency**
   - All-Time leaderboard matches Today's leaderboard styling (newspaper aesthetic, table design)
   - Loading skeleton during data fetch
   - Error states handled gracefully ("Failed to load all-time leaderboard")
   - Responsive design (mobile-first, scrollable table)
   - Accessibility: semantic HTML, ARIA labels, keyboard navigation, WCAG AA compliance

6. **Performance & Caching**
   - All-time leaderboard query optimized with proper indexes
   - Response cached with 5-minute TTL (balances freshness with performance)
   - Query uses database aggregation (MIN function) to avoid loading all completions

7. **Real-Time Updates (Optional Enhancement)**
   - If user completes puzzle and achieves new personal best: all-time leaderboard updates
   - Update only triggers if completion time is faster than user's previous best
   - Uses existing Supabase Realtime infrastructure for consistency

## Tasks / Subtasks

- [ ] Create database query for all-time leaderboard (AC: #2)
  - [ ] Write SQL query: SELECT user_id, MIN(completion_time_seconds), MIN(submitted_at) FROM leaderboards GROUP BY user_id ORDER BY MIN(completion_time_seconds)
  - [ ] Add database index on (user_id, completion_time_seconds) if not exists
  - [ ] Create server action: `getGlobalLeaderboard()` in actions/leaderboard.ts
  - [ ] Create server action: `getPersonalBest(userId)` for personal rank
  - [ ] Write unit tests for query logic

- [ ] Implement tab navigation UI (AC: #1)
  - [ ] Create `<LeaderboardTabs>` component with "Today" and "All-Time" options
  - [ ] Add tab state management (useState + localStorage persistence)
  - [ ] Style tabs with newspaper aesthetic (active/inactive states)
  - [ ] Ensure mobile responsive design
  - [ ] Add keyboard navigation support (Tab, Arrow keys)
  - [ ] Write component tests for tab switching

- [ ] Build All-Time leaderboard table (AC: #2, #5)
  - [ ] Create `<GlobalLeaderboardTable>` component (reuse/adapt existing LeaderboardTable)
  - [ ] Fetch all-time leaderboard data on tab switch
  - [ ] Display rank, username, personal best time in table format
  - [ ] Highlight current user's row if in top 100
  - [ ] Add loading skeleton during fetch
  - [ ] Add error state component
  - [ ] Write component tests

- [ ] Implement personal all-time rank footer (AC: #3)
  - [ ] Adapt `<PersonalRankFooter>` component to support all-time mode
  - [ ] Calculate user's all-time rank from database
  - [ ] Display sticky footer when user rank > 100
  - [ ] Show auth prompt for guest users
  - [ ] Write component tests

- [ ] Add empty states (AC: #4)
  - [ ] Create empty state component for no global completions
  - [ ] Create empty state for user with no completions
  - [ ] Match existing EmptyState styling

- [ ] Implement caching & performance optimization (AC: #6)
  - [ ] Add 5-minute cache to server action using Next.js cache
  - [ ] Verify database indexes exist for optimal query performance
  - [ ] Test query performance with large dataset (>10,000 records)

- [ ] Optional: Real-time updates (AC: #7)
  - [ ] Detect when user achieves new personal best
  - [ ] Trigger all-time leaderboard refresh on personal best
  - [ ] Use existing Realtime subscription pattern

- [ ] Testing & accessibility (AC: #5)
  - [ ] E2E test: Navigate tabs, verify data loads correctly
  - [ ] E2E test: Verify personal rank displays for auth users
  - [ ] Accessibility audit: screen reader, keyboard navigation
  - [ ] Cross-browser testing (Chrome, Safari, Firefox)
  - [ ] Mobile testing (iOS Safari, Android Chrome)

## Dev Notes

### Architecture Patterns

**Tab Navigation Pattern:**
- Use React state + localStorage for tab persistence
- Follow existing client-side navigation patterns in the app
- Ensure no full page reloads on tab switch (client-side only)

**Data Fetching Strategy:**
- Server actions in `actions/leaderboard.ts` (consistent with existing pattern)
- Separate actions for daily vs all-time to keep queries clean
- Use Next.js server-side rendering for initial data load
- Client-side fetching on tab switch with loading states

**Component Reuse:**
- Extend existing `<LeaderboardTable>` component with mode prop ("daily" | "allTime")
- Reuse `<PersonalRankFooter>` with mode awareness
- Reuse `<EmptyState>`, `<LeaderboardError>`, `<LeaderboardSkeleton>`

### Database Schema Notes

**Existing Tables:**
- `leaderboards` table: Contains puzzle_id, user_id, completion_time_seconds, submitted_at, rank
- `users` table: Contains id, username (needed for display)

**Query Strategy:**
```sql
-- All-Time Top 100
SELECT
  user_id,
  MIN(completion_time_seconds) as best_time,
  MIN(submitted_at) FILTER (WHERE completion_time_seconds = MIN(completion_time_seconds)) as achieved_at
FROM leaderboards
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY best_time ASC, achieved_at ASC
LIMIT 100
```

**Index Requirements:**
- Existing index on `leaderboards(user_id, completion_time_seconds)` should suffice
- Verify with EXPLAIN ANALYZE for performance

### Testing Standards

**Unit Tests (Jest + React Testing Library):**
- Test `getGlobalLeaderboard()` action with mock data
- Test `<LeaderboardTabs>` component: tab switching, persistence
- Test `<GlobalLeaderboardTable>` rendering with various data states

**E2E Tests (Playwright):**
- Test full user flow: load page → switch to All-Time → verify data
- Test personal rank display for auth user
- Test guest user sees auth prompt

**Accessibility Tests:**
- Verify tab navigation with keyboard only
- Screen reader announces tab changes
- Color contrast meets WCAG AA
- Touch targets ≥44x44px

### Project Structure Notes

**Files to Create:**
- `components/leaderboard/LeaderboardTabs.tsx` - Tab navigation component
- `components/leaderboard/GlobalLeaderboardTable.tsx` - All-time leaderboard table (or extend existing)

**Files to Modify:**
- `actions/leaderboard.ts` - Add `getGlobalLeaderboard()` and `getPersonalBest()` actions
- `app/[locale]/leaderboard/page.tsx` - Integrate tab navigation
- `components/leaderboard/LeaderboardPageClient.tsx` - Add tab state management
- `lib/types/database.ts` - No changes needed (uses existing schema)

**Files to Reference:**
- `actions/leaderboard.ts:24-75` - Existing `getLeaderboard()` pattern to follow
- `components/leaderboard/LeaderboardTable.tsx` - Component structure to reuse
- `components/leaderboard/PersonalRankFooter.tsx` - Personal rank display pattern
- `app/[locale]/leaderboard/page.tsx:25-101` - Page structure and data fetching pattern

### References

**Source Documents:**
- [PRD: FR-5.1 Competitive Leaderboards](docs/PRD.md#competitive-leaderboards) - Global rankings requirement
- [Architecture: Supabase Query Patterns](docs/architecture.md#database-queries) - Query optimization guidelines
- [Epic 4: Story 4.1](docs/epics.md#story-41-global-daily-leaderboard-top-100-personal-rank) - Daily leaderboard implementation (reference for consistency)

**Existing Implementation References:**
- Daily leaderboard query: `actions/leaderboard.ts:30-43`
- Leaderboard UI components: `components/leaderboard/*`
- Real-time subscription pattern: `components/leaderboard/LeaderboardPageClient.tsx`

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
