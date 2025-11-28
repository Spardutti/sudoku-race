# sudoku-race - Product Requirements Document

**Author:** Spardutti
**Date:** 2025-11-08
**Version:** 1.0

---

## Executive Summary

Sudoku Daily is a pure, authentic daily Sudoku platform that brings the social mechanics of Wordle to Sudoku purists. Unlike existing Sudoku apps cluttered with hints and helpers, Sudoku Daily respects the player's intelligence with one daily challenge, no hand-holding, and authentic competitive leaderboards.

The platform fills a clear market gap: no free daily Sudoku exists with Wordle-style viral sharing mechanics and pure competitive integrity. With 50M daily puzzle players (NYT Games alone) and proven viral mechanics (Wordle: 90 → 2M users in 2 months after adding sharing), Sudoku Daily applies validated distribution strategies to an established puzzle format with 40+ years of market validation.

### What Makes This Special

**When someone completes a Sudoku Daily puzzle and shares their result, they can say with pride: "I did this with MY brain, not an algorithm's help."**

This authenticity is the magic thread woven throughout the product:

1. **Pure Competitive Integrity** - No AI hints means leaderboards are authentic and sharing feels meaningful
2. **Daily Ritual Format** - One puzzle per day creates scarcity, urgency, and shared community experience
3. **Viral Social Mechanics** - Emoji grid sharing tells your solving journey without spoilers
4. **Newspaper Aesthetic** - Classic, trustworthy design that honors 40+ years of Sudoku tradition

---

## Project Classification

**Technical Type:** Web Application (SaaS)
**Domain:** General / Entertainment (Daily Puzzle Gaming)
**Complexity:** Medium

This is a **web-based SaaS application** combining single-page architecture (Next.js 16 / React 19), real-time features (leaderboards), social/viral mechanics (sharing), and OAuth authentication. General domain with standard web best practices (no complex regulatory requirements).

---

## Success Criteria

### Phase 1 - Product-Market Fit Validation (First 30 Days)

- **10 daily active users** consistently returning for 1 month
- 70%+ completion rate (difficulty calibrated correctly)
- At least 1 user shares result daily (validates viral mechanics)

### North Star Goal (6-12 Months)

- **1,000 daily active users**
- Validates: Viral mechanics working, sustainable community

### Key Performance Indicators

**Engagement:**
- **D7 Retention: >40%** - Players return within a week
- **D30 Retention: >25%** - Long-term habit formation
- **Daily Completion Rate: 70-80%** - Proper difficulty balance
- **Average Solve Time: 8-15 minutes** - Medium difficulty indicator

**Growth & Viral:**
- **Viral Coefficient: >1.0** - Each user brings >1 new user
- **Guest → Auth Conversion: >10%** - Value in tracking streaks/rank
- **Sharing Rate: >30%** - Players proudly share completions
- **Week-over-Week Growth: 15-20%** - Organic viral trajectory

**Competitive Integrity:**
- **Leaderboard Trust: <1%** flagged for suspicious activity
- **Streak Retention: >60%** - Auth users maintain 7+ day streaks

### Why These Metrics Matter

- **Completion rate** → Difficulty calibrated right
- **Retention** → Authentic challenge creates daily habit
- **Viral coefficient** → Sharing pride drives organic growth
- **Auth conversion** → Leaderboard integrity and streaks matter
- **Competitive integrity** → "No hints" preserves authentic competition

---

## Product Scope

### MVP - Minimum Viable Product

**Core Daily Puzzle:**
- One medium-difficulty Sudoku per day (UTC-based, same for all users)
- Clean 9x9 grid (mobile-optimized)
- Timer (auto-start, stops on completion)
- Server-side validation
- **NO hints, NO auto-fill, NO helpers** (core differentiator)

**Guest Play:**
- Play without auth (session-based progress in browser)
- See completion time
- View leaderboard (not ranked)
- Prompted to sign in after completion

**Authentication & Leaderboards:**
- OAuth (Google, GitHub, Apple)
- Session data preserved on auth
- Global leaderboard (top 100 + personal rank)
- Real-time updates

**Social Viral Mechanics:**
- Emoji grid sharing (shows solve journey without spoilers)
- One-tap share (Twitter/X, WhatsApp, clipboard)
- Primary growth engine

**Streak Tracking:**
- Consecutive days completion (auth users only)
- Current streak and longest streak
- Streak freeze (1 missed day per week allowed)

**Statistics (Auth):**
- Total puzzles solved
- Current/longest streak
- Average/best completion time

**Design:**
- Newspaper aesthetic (black & white, serif headers)
- Mobile-first, responsive

### Growth Features (Post-MVP, Months 3-6)

- Friend leaderboards
- Historical puzzles (premium)
- Extended statistics
- Achievement system
- Profile customization
- Ad integration
- PWA capabilities
- Premium subscription ($3.99/month or $29.99/year)

### Vision Features (6-12+ Months)

- Mobile native apps (iOS, Android)
- Multiple difficulty levels
- Tournaments and events
- Community features
- Internationalization
- API for third-party integrations
- Expand to other logic puzzles
- "Wordle of Sudoku" with 100K+ daily solvers

### Explicitly Out of Scope (Never)

❌ **Puzzle hints or AI helpers** (undermines competitive integrity)
❌ **Unlimited play modes** (contradicts daily scarcity)
❌ **AI assistance or auto-solve** (destroys leaderboard authenticity)
❌ **Pay-to-win features** (unfair competitive advantage)
❌ **"Skip puzzle" or "extra puzzles" as IAP** (breaks daily ritual)

---

## User Experience Principles

### Visual Personality: Classic Newspaper Meets Modern Social

**Design Philosophy:**
- **Radical simplicity** - One thing done perfectly
- **Newspaper aesthetic** - Classic, trustworthy, no clutter
- **Respect the player** - No dumbing down, no hand-holding

**Visual Language:**
- Black & white base with spot color accent
- Serif typography for headers (newspaper style)
- Sans-serif for UI (screen readability)
- Generous white space
- Grid-based layout

**Color Palette:**
- Primary: #000000 (black)
- Background: #FFFFFF (white)
- Spot Color: #1a73e8 (blue - CTAs, highlights)
- Success: #0f9d58 (green)
- Neutral: #757575 (gray)

### Key Interactions

**1. Daily Ritual Flow:**
```
Visit → "Today's Puzzle" → Start timer → Solve → Submit →
Validate → See time + rank → Share emoji grid → Return tomorrow
```

**2. Number Input:**
- **Mobile:** Number pad (1-9 + Clear), large tap targets (44x44px min)
- **Desktop:** Type 1-9 OR click number palette, arrow keys navigate

**3. Error Handling (Pure Approach):**
- **NO real-time error checking** during solve
- **NO hints or helpers**
- On submit: "Not quite right. Keep trying!" (if incorrect)
- Timer continues, unlimited attempts

**4. Completion Moment:**
- Success animation (simple)
- Completion time displayed
- Leaderboard rank revealed
- One-tap share button
- Auth prompt for guests (gentle, non-blocking)

**5. Emoji Grid Sharing:**

**Format:**
```
Sudoku Daily #42
⏱️ 12:34

🟩⬜⬜🟨🟨⬜⬜⬜🟩
🟩🟩⬜⬜🟨🟨⬜⬜🟩
🟩🟩🟩⬜⬜🟨🟨⬜🟩

Play today's puzzle: [link]
```

**Legend:**
- 🟩 = Correct on first fill
- 🟨 = Corrected during solve
- ⬜ = Pre-filled clue

**6. Timer Behavior:**
- Auto-starts when puzzle loads
- Runs continuously through submit attempts
- Pauses if tab loses focus (fair timing)
- Server tracks actual time (client is display only)
- Format: MM:SS

**7. Guest-to-Auth Conversion:**
- Never block core experience
- Show what they're missing after completion ("You'd be #347!")
- Preserve progress (session data saved retroactively)
- Seamless OAuth (one click)
- No nagging (gentle prompt once per session)

---

## Functional Requirements

### 1. Daily Puzzle System

**FR-1.1: Daily Puzzle Generation & Delivery**

One medium-difficulty Sudoku per day, refreshes at midnight UTC (same puzzle for all users).

**Acceptance Criteria:**
- Single puzzle per calendar day (UTC)
- Difficulty consistent (medium)
- 70-80% completion rate target

**User Value:** Shared daily ritual, community experience

---

**FR-1.2: Puzzle State Management**

Progress auto-saved automatically.

**Acceptance Criteria:**
- Auto-save on every cell input
- Guest: localStorage
- Auth: database
- State includes: filled cells, elapsed time, completion status
- Page refresh preserves state
- Auth users resume on different devices

**User Value:** Never lose progress, solve at own pace

---

### 2. Solving Experience

**FR-2.1: Sudoku Grid Interface**

Clean 9x9 grid optimized for mobile and desktop.

**Acceptance Criteria:**
- Mobile: Touch-optimized (44x44px min tap targets)
- Desktop: Click to select
- Pre-filled clues read-only, distinct from user entries
- Selected cell highlighted
- Responsive across all breakpoints
- Accessible (keyboard nav, screen reader)

**User Value:** Clear, distraction-free interface

---

**FR-2.2: Number Input System**

Fast, intuitive number input.

**Acceptance Criteria:**
- **Mobile:** Number pad (1-9 + Clear), 44x44px min
- **Desktop:** Type 1-9 OR click palette, arrow keys navigate
- Backspace/Delete clears cell
- Immediate visual feedback

**User Value:** Efficient solving flow

---

**FR-2.3: Solution Validation (Server-Side)**

Pure challenge with no real-time error checking.

**Acceptance Criteria:**
- **NO real-time validation** during solve
- Submit button triggers server validation
- Unlimited attempts
- If incorrect: "Not quite right. Keep trying!"
- If correct: Completion flow (time, rank, sharing)
- Timer runs through all attempts
- Server-side only (prevent client manipulation)

**User Value:** Pure challenge, "I did this with MY brain"

---

### 3. Timer & Timing

**FR-3.1: Automatic Timer**

Fair, accurate timing for competitive leaderboards.

**Acceptance Criteria:**
- Auto-starts on page load
- MM:SS format, updates every second
- Continues through submit attempts, stops on correct completion
- Pauses when tab loses focus, resumes when regains
- Server validates actual time (client display only)

**User Value:** Fair competitive metric

---

**FR-3.2: Completion Time Recording**

Server-side time tracking as source of truth.

**Acceptance Criteria:**
- Server calculates elapsed time (immune to client manipulation)
- Time displayed on completion
- Persisted for auth users
- Used for leaderboard ranking (fastest first)

**User Value:** Authentic competitive metric

---

### 4. Authentication & User Management

**FR-4.1: Guest Play**

Zero-friction guest experience.

**Acceptance Criteria:**
- No signup required
- Progress saved in localStorage
- See completion time
- View leaderboard (not ranked)
- "You'd be #347!" message after completion
- Gentle auth prompt (non-blocking)

**User Value:** Zero friction to try

---

**FR-4.2: OAuth Authentication**

Seamless one-click auth with session preservation.

**Acceptance Criteria:**
- OAuth providers: Google, GitHub, Apple
- One-click flow
- Guest session preserved and retroactively saved
- Seamless transition (no data loss)
- Immediate leaderboard rank after auth

**User Value:** Easy auth, no lost progress

---

**FR-4.3: User Profile & Account Management**

Persistent identity and progress tracking.

**Acceptance Criteria:**
- Store: username, email, OAuth provider
- Profile page: total solved, streaks, times
- Logout functionality
- Delete account (GDPR)

**User Value:** Persistent identity, track progress

---

### 5. Leaderboard System

**FR-5.1: Global Daily Leaderboard**

Real-time competitive ranking.

**Acceptance Criteria:**
- Top 100 for today's puzzle
- Displays: rank, username, time
- Real-time updates (<1s latency)
- Personal rank always visible (even if outside top 100)
- Sorted by time (fastest first), ties broken by timestamp
- Resets daily at midnight UTC
- Smooth animations for new entries

**User Value:** Competitive motivation, community

---

**FR-5.2: Leaderboard Anti-Cheat**

Preserve competitive integrity.

**Acceptance Criteria:**
- Only auth users on leaderboard
- Server-side time validation
- Times <2 minutes flagged for review
- Report suspicious entries
- Admin review system
- Cheaters removed

**User Value:** Authentic competition

---

### 6. Streak Tracking

**FR-6.1: Consecutive Day Streaks**

Daily habit formation.

**Acceptance Criteria:**
- Track consecutive completion days (auth only)
- Current streak and longest streak (all-time)
- One completion per day counts
- Displayed on profile and post-completion

**User Value:** Habit formation, accomplishment

---

**FR-6.2: Streak Freeze (Healthy Engagement)**

Prevent toxic compulsion.

**Acceptance Criteria:**
- 1 missed day per 7-day rolling period allowed
- 2+ missed days break streak
- "Streak Freeze Active" indicator
- Positive messaging (not punishing)

**User Value:** Reduces anxiety, healthier engagement

---

### 7. Social Sharing

**FR-7.1: Emoji Grid Generation**

Visual solve journey that doesn't spoil puzzle.

**Acceptance Criteria:**
- Generate emoji grid: 🟩 (first-fill), 🟨 (corrected), ⬜ (clue)
- Include: puzzle number, completion time, link
- Preview before sharing
- Accurately represents solve path

**User Value:** Share accomplishment without spoilers

---

**FR-7.2: One-Tap Sharing**

Effortless sharing across channels.

**Acceptance Criteria:**
- Share to: Twitter/X, WhatsApp, Copy to clipboard
- Single tap/click
- All options work mobile and desktop
- Shared content: emoji grid, time, puzzle number, link

**User Value:** Effortless viral growth (primary growth engine)

---

### 8. Statistics & Progress

**FR-8.1: Personal Statistics (Auth)**

Track improvement over time.

**Acceptance Criteria:**
- Total puzzles solved (lifetime)
- Current/longest streak
- Average/best completion time
- Completion history (calendar view)
- Real-time updates
- Persists across devices
- Not available for guests (auth incentive)

**User Value:** Track improvement, motivation

---

## Non-Functional Requirements

### Performance (Critical - Daily Habit Depends On It)

**Page Load:**
- Initial Load: <2 seconds
- Time to Interactive: <3 seconds
- Lighthouse Score: >90
- First Contentful Paint: <1 second

**Runtime:**
- Leaderboard Query: <1 second
- Real-time Updates: <1 second
- Puzzle State Save: <100ms
- Smooth 60fps interactions

**Mobile:**
- Works on 3-5 year old devices
- Fast on 3G/4G
- Minimal JS bundle (<200KB gzipped)

---

### Security (Critical - User Data & Competitive Integrity)

**Authentication:**
- Secure OAuth 2.0 (Google, GitHub, Apple)
- No password storage
- Secure session management (HttpOnly, Secure, SameSite cookies)

**Anti-Cheat:**
- Server-side validation (all solution checking)
- Server-side timing (client display only)
- Anomaly detection (<2 min threshold flagged)
- Rate limiting (prevent brute force)

**Data Security:**
- HTTPS only (TLS 1.3+)
- Database encryption at rest
- Secure headers (CSP, HSTS, X-Frame-Options)
- No sensitive data in localStorage

**Privacy & Compliance:**
- GDPR compliance (user can delete account/data)
- Data minimization
- Clear privacy policy

---

### Scalability (Important - Growth Expected)

**Concurrent Users:**
- MVP: 100+ concurrent
- Growth: 1,000+ concurrent
- Scale: 10,000+ concurrent

**Database:**
- Efficient queries (indexed properly)
- Connection pooling
- Supabase free tier sufficient for MVP (500MB, 100GB bandwidth)

**Architecture:**
- Serverless (Next.js API routes on Vercel)
- Auto-scaling
- CDN for static assets
- Real-time via Supabase WebSockets

**Caching:**
- Puzzle data: 1 day TTL
- Leaderboard: 5-10s or real-time
- User profile: cached with invalidation

---

### Reliability & Availability

**Uptime:**
- Target: >99.5% (MVP)
- Vercel SLA: 99.99% (paid plans)

**Daily Puzzle Delivery (Mission-Critical):**
- Available at midnight UTC
- Automated rotation
- Fallback puzzle if primary fails
- Monitoring with alerts

**Error Handling:**
- Real-time fails → polling fallback
- Slow queries → cached data with staleness indicator
- Auto-save fails → retry with exponential backoff

**Data Persistence:**
- User progress never lost
- Daily automated backups
- Point-in-time recovery
- 7 days retention minimum

**Monitoring:**
- Uptime (Vercel + UptimeRobot)
- Error tracking (Sentry)
- Performance (Core Web Vitals)
- Alerts on critical failures

---

### Accessibility (WCAG 2.1 Level AA)

**Requirements:**
- Keyboard navigation (arrow keys, number keys)
- Screen reader support (semantic HTML, ARIA)
- Sufficient color contrast (WCAG AA)
- Focus indicators
- Accessible error messages
- Text sizing/zoom support (up to 200%)

**Acceptance:**
- WAVE audit passes (0 errors)
- Keyboard-only tested
- Screen reader tested (NVDA/JAWS/VoiceOver)
- Color contrast meets 4.5:1 (text), 3:1 (UI)

---

## References

### Input Documents

**Product Brief:** `docs/product-brief-sudoku-race-2025-11-08.md`
- Product vision, success metrics, MVP scope, competitive positioning

**Market Research:** `docs/research-market-2025-11-08.md`
- Viral mechanics (Wordle case study), competitive landscape, market opportunity (50M daily players)

### Key Research Findings

**Market Validation:**
- 50M daily puzzle players (NYT Games)
- Wordle: 90 → 2M users in 2 months (emoji sharing)
- Puzzle game market: $23B projected (2025)
- Gap: No free daily Sudoku with viral social mechanics

**Critical Success Factors:**
- Emoji sharing drives 60-70% of growth
- Players in social groups 2.5x more likely to become long-term
- Medium difficulty: 70-80% completion rate target
- Mobile-first: 17+ min daily engagement on mobile
- Streak mechanics: 69% of successful puzzle games use them

**Competitive Positioning:**
- NYT Games: Premium ($50/yr), not Sudoku-focused
- Sudoku.com: Dominant free, no daily scarcity or social
- Good Sudoku: Daily + leaderboards, paid ($5-7), has AI hints
- **Our Gap:** Free + Social + Pure Competition

---

## Next Steps

### After PRD Approval

1. **Epic & Story Breakdown** → `/bmad:bmm:workflows:create-epics-and-stories`
2. **UX Design** (if needed) → `/bmad:bmm:workflows:create-design`
3. **Architecture** → `/bmad:bmm:workflows:create-architecture`
4. **Gate Check** → `/bmad:bmm:workflows:solutioning-gate-check`

---

## Document Summary

**Created:** November 8, 2025
**Author:** Spardutti
**Type:** Web Application (Next.js 16 + Supabase)
**Complexity:** Medium (greenfield SaaS)

**Completeness:**
- ✅ Executive Summary & Product Magic
- ✅ Success Criteria (10 → 1,000 users)
- ✅ Product Scope (MVP / Growth / Vision)
- ✅ UX Principles (Newspaper Aesthetic, Pure Challenge)
- ✅ Functional Requirements (16 across 8 areas)
- ✅ Non-Functional Requirements (5 categories)
- ✅ References (Product Brief, Market Research)

**Total Requirements:** 16 Functional + 5 NFR categories

**Ready for:** Epic breakdown and architecture design

---

_The magic of Sudoku Daily - "I did this with MY brain" - is woven throughout every requirement._

_Created through BMad Method PRD workflow_
_Refactored: 2025-11-28_
_Lines reduced: 1,205 → 819 (32% reduction)_
