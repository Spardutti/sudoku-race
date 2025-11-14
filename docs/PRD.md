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

1. **Pure Competitive Integrity** - No AI hints means leaderboards are authentic and sharing feels meaningful. You earned it.
2. **Daily Ritual Format** - One puzzle per day for everyone globally creates scarcity, urgency, and shared community experience
3. **Viral Social Mechanics** - Emoji grid sharing tells your solving journey without spoilers, driving organic growth
4. **Newspaper Aesthetic** - Classic, trustworthy design that honors 40+ years of Sudoku tradition while adding modern social features

Success means players experience that special moment of completion knowing they solved it themselves, then share that accomplishment with a community that values authentic challenge.

---

## Project Classification

**Technical Type:** Web Application (SaaS)
**Domain:** General / Entertainment (Daily Puzzle Gaming)
**Complexity:** Medium

**Classification Details:**

This is a **web-based SaaS application** combining:
- Single-page application (SPA) architecture with Next.js 16 / React 19
- Real-time features (leaderboards, live updates)
- Social/viral mechanics (sharing, community features)
- Authentication and user management (OAuth providers)
- Mobile-responsive design (mobile-first approach)

**Domain Context:**

General domain with no complex regulatory requirements. Standard web application best practices apply:
- Data privacy (user accounts, completion times, preferences)
- Security (authentication, authorization, server-side validation)
- Performance (fast load times, real-time updates)
- Scalability (growing user base from 10 → 1000+ DAU)

---

## Success Criteria

### What Success Looks Like

**Phase 1 - Product-Market Fit Validation (First 30 Days):**
- **10 daily active users consistently returning** for 1 month
- Validates: Real retention, daily habit formation, authentic demand
- Players complete puzzles (70%+ completion rate) and return tomorrow
- At least 1 user shares their result daily (viral mechanics validation)

**North Star Goal (6-12 Months):**
- **1,000 daily active users**
- Validates: Viral mechanics working, word-of-mouth growth, sustainable community
- Proves the model works at scale

### Key Performance Indicators

**Engagement Metrics:**
- **D7 Retention: >40%** - Players return within a week (puzzle game benchmark)
- **D30 Retention: >25%** - Long-term habit formation indicating daily ritual success
- **Daily Completion Rate: 70-80%** - Difficulty calibrated correctly (challenging but achievable)
- **Average Solve Time: 8-15 minutes** - Indicates proper medium difficulty balance

**Growth & Viral Metrics:**
- **Viral Coefficient: >1.0** - Each user brings >1 new user via sharing (exponential growth)
- **Guest → Auth Conversion: >10%** - Players see value in tracking streaks/rank
- **Sharing Rate: >30%** - Players proudly share completions (validates the magic)
- **Week-over-Week Growth: 15-20%** - Organic viral growth trajectory

**Competitive Integrity Metrics:**
- **Leaderboard Trust: <1%** - Flagged for suspicious activity (authentic competition)
- **Streak Retention: >60%** - Authenticated users maintain 7+ day streaks

### Why These Metrics Matter

These metrics validate the core product hypothesis:

- **Completion rate** → Difficulty is calibrated right (not too easy, not frustrating)
- **Retention** → Players value the authentic challenge enough to make it a daily habit
- **Viral coefficient** → Sharing pride ("I solved it myself") drives organic growth
- **Auth conversion** → Leaderboard integrity and streak tracking matter to players
- **Competitive integrity** → No hints preserves authentic competition (our differentiator)

**Success means:** Players experience that special moment of completion knowing they solved it themselves, then share that accomplishment with a community that values authentic challenge.

---

## Product Scope

### MVP - Minimum Viable Product (Launch - Months 1-2)

**What must work for this to be useful?**

**Core Daily Puzzle Experience:**
- One medium-difficulty Sudoku puzzle per day (UTC-based, same puzzle for all users globally)
- Clean 9x9 grid interface with number input (mobile-optimized)
- Timer (starts when puzzle loads, stops on completion)
- Basic conflict validation on submit
- **NO hints, NO auto-fill, NO helpers** (this is our core differentiator)

**Guest Play:**
- Play without authentication (session-based progress in browser)
- See completion time upon finishing
- View global leaderboard (but not ranked on it)
- Prompted to sign in after completion ("Join the leaderboard!")

**Authentication & Leaderboards:**
- OAuth providers (Google, GitHub, Apple)
- Session data preserved and retroactively saved upon auth
- Global leaderboard (top 100 players + user's personal rank)
- Real-time leaderboard updates
- Displays: rank, username, completion time

**Social Viral Mechanics:**
- Emoji grid sharing format (shows solving journey without spoilers)
- One-tap share to Twitter/X, WhatsApp, clipboard
- Format includes: completion time + emoji grid + link to game + puzzle date/number
- This is the primary growth engine

**Streak Tracking:**
- Consecutive days of puzzle completion (authenticated users only)
- Display current streak and longest streak
- Streak freeze mechanic (1 missed day per week doesn't break streak - avoids toxic compulsion)

**Newspaper Aesthetic Design:**
- Black & white base with spot color highlights
- Serif typography (newspaper style)
- Clean, uncluttered layout
- "Today's puzzle" dateline header
- Mobile-responsive, mobile-first design

**Basic Statistics (Authenticated Users):**
- Total puzzles solved
- Current streak / Longest streak
- Average completion time
- Best time

### Growth Features (Post-MVP, Months 3-6)

**What makes it competitive?**

- Friend leaderboards (compete with specific friends)
- Historical puzzles (premium feature: play past puzzles)
- Extended statistics (detailed performance analytics, trends over time)
- Achievement system (milestones, badges for accomplishments)
- Profile customization (avatars, display name colors, themes)
- Ad integration (display ads, rewarded video for premium features)
- Progressive Web App (PWA) capabilities (app-like experience)
- Premium subscription tier ($3.99/month or $29.99/year)

### Vision Features (Future, 6-12+ Months)

**What's the dream version?**

- Mobile native apps (iOS, Android on app stores)
- Multiple difficulty levels (easy/hard variants of same daily puzzle)
- Tournaments and events (special weekend puzzles, competitions)
- Community features (comments, puzzle discussions, forums)
- Internationalization (multi-language support for global expansion)
- API for third-party integrations
- Expand to other logic puzzles (applying same social daily model)
- Become the "Wordle of Sudoku" with 100K+ daily solvers

### Explicitly Out of Scope (Never)

**These features violate core product principles and will NEVER be included:**

- ❌ **Puzzle hints or AI helpers** (undermines competitive integrity - our key differentiator)
- ❌ **Unlimited play modes** (contradicts daily scarcity model)
- ❌ **AI assistance or auto-solve** (destroys leaderboard authenticity and player pride)
- ❌ **Pay-to-win features** (unfair competitive advantage)
- ❌ **"Skip puzzle" or "extra puzzles" as IAP** (breaks the daily ritual model)

**These boundaries preserve what makes Sudoku Daily special:** Authentic challenge, fair competition, and meaningful accomplishment.

---

## Web Application Specific Requirements

### Browser & Platform Support

**Primary Targets:**
- Modern browsers: Chrome, Safari, Firefox, Edge (last 2 versions)
- Mobile browsers: iOS Safari, Chrome Mobile (mobile-first priority)
- No IE11 support (modern web standards only)

**Rationale:** Research shows 17+ minutes average daily engagement happens on mobile. Mobile experience is mission-critical.

### Responsive Design Requirements

**Breakpoints:**
- **Mobile: 320px - 767px** (primary focus - most users)
- **Tablet: 768px - 1024px** (secondary)
- **Desktop: 1025px+** (tertiary)

**Mobile-First Design Priorities:**
- Touch-optimized number input with large tap targets for 9x9 grid
- Fast load time on 3G/4G networks (<2s target)
- Smooth interactions on 3-5 year old devices
- Portrait orientation primary, landscape support
- One-handed usability where possible

### Performance Targets

**Critical Path Performance:**
- **Initial Load: <2 seconds** (on standard broadband)
- **Time to Interactive (TTI): <3 seconds**
- **Lighthouse Performance Score: >90**
- **First Contentful Paint (FCP): <1 second**

**Concurrent Users:**
- Support 100+ concurrent users without degradation (MVP)
- Scale to 1,000+ as growth accelerates

**Why Performance Matters:** Players want to jump in quickly during their morning ritual. Slow loads kill daily habits.

### Real-Time Features

**Leaderboard Requirements:**
- Real-time updates as players complete puzzles
- <1 second query time for leaderboard data
- WebSocket or Supabase real-time subscriptions
- Optimistic UI updates (show user's completion immediately)
- Graceful degradation if real-time fails (polling fallback)

### SEO Strategy

**Target Keywords (Primary):**
- "daily sudoku"
- "sudoku today"
- "sudoku online free"
- "daily puzzle game"

**SEO Technical Requirements:**
- Server-side rendering (SSR) for landing page and puzzle page
- Dynamic meta tags for daily puzzle (Open Graph tags for social sharing)
- Fresh content daily (new puzzle = new indexing opportunity)
- Sitemap with daily puzzle URLs
- Structured data (Schema.org) for puzzle games

**Expected Traffic Sources:**
- 60-70% viral social sharing (primary growth engine)
- 20-25% organic search (SEO)
- 10-15% direct/word-of-mouth

### Accessibility Requirements

**WCAG 2.1 Level AA Compliance:**
- Keyboard navigation (arrow keys for grid navigation, number keys for input)
- Screen reader support (announce cell values, conflicts, completion)
- Sufficient color contrast (critical for newspaper aesthetic readability)
- Focus indicators for keyboard users
- Accessible error messages (conflicts, validation)

**Why Accessibility Matters:**
- Broadens audience reach
- Improves usability for all players (keyboard shortcuts benefit everyone)
- Aligns with "respecting the player" philosophy

### Progressive Web App (PWA) Capabilities

**For Post-MVP (Growth Phase):**
- Installable as app (Add to Home Screen)
- Offline support (cache today's puzzle for offline solving)
- Push notifications (optional: remind to play today's puzzle)
- App-like experience without app store friction or fees
- Background sync (submit completion when back online)

**Benefits:**
- Reduces friction vs native app download
- Faster iteration (no app store approval delays)
- Lower development cost (single codebase)

### Technical Stack Alignment

**Frontend:**
- Next.js 16 (React 19) - already scaffolded
- TypeScript for type safety
- Tailwind CSS 4 for newspaper aesthetic styling

**Backend:**
- Next.js API routes (serverless functions)
- Deployed on Vercel (free tier for MVP, scales as needed)

**Database & Auth:**
- Supabase (free tier for MVP)
  - PostgreSQL database
  - Supabase Auth (OAuth providers: Google, GitHub, Apple)
  - Real-time subscriptions (leaderboard updates)

**Key Technical Constraints:**
- Server-side solution validation (prevent cheating)
- Session management for guest users (preserve state)
- Real-time leaderboard updates (<1s latency)

---

## User Experience Principles

### Visual Personality: Classic Newspaper Meets Modern Social

**Design Philosophy:**
- **Radical simplicity** - One thing done perfectly (inspired by Fortnite countdown timer story)
- **Newspaper aesthetic** - Classic, trustworthy, no clutter
- **Respect the player** - No dumbing down, no hand-holding, no dark patterns

**Visual Language:**
- **Black & white base** with spot color (single accent color for CTAs and highlights)
- **Serif typography** for headers and branding (newspaper style - authoritative, classic)
- **Sans-serif for UI elements** (readability on screens)
- **Generous white space** - breathable, focused layout
- **Grid-based layout** - structured, organized (mirrors Sudoku grid structure)

**Mood & Feel:**
- Professional but approachable
- Classic but not outdated
- Focused, calm, meditative (unlike "gamey" cluttered puzzle apps)
- Trustworthy, authentic
- Quiet confidence

**Why Newspaper Aesthetic Matters:**
- Differentiates from colorful, loud puzzle apps
- Appeals to puzzle purists who value tradition
- Newspaper Sudoku has 40+ years of cultural cache
- Creates sense of daily ritual (like morning newspaper with coffee)

### Key Interactions

**1. The Daily Ritual Flow:**
```
Visit site → See "Today's Puzzle" dateline → Start timer → Solve → Submit →
Validate → See time + rank → Share emoji grid → Come back tomorrow
```

**2. Number Input (Critical Mobile UX):**

**Mobile:**
- Tap cell → Number pad appears (1-9 buttons, large tap targets 44x44px minimum)
- Tap number → Fills cell
- Visual feedback on tap (selected cell highlighted)

**Desktop:**
- Click cell → Type number (1-9 keys)
- OR Click cell → Click number from palette
- Arrow keys to navigate grid
- Backspace/Delete to clear cell

**Keyboard Shortcuts (Power Users):**
- Arrow keys: Navigate grid
- Number keys (1-9): Input number in selected cell
- 0 or Backspace: Clear selected cell
- Tab: Move to next empty cell

**3. Error Handling & Validation (Pure Approach):**

**During Solving:**
- **NO real-time error checking** (no red highlights for conflicts)
- **NO hints or helpers** (player solves independently)
- **NO hand-holding** (respects player intelligence)
- Clean grid, player fills it however they want

**On Submit:**
- Player clicks "Submit" when they think they're done
- **Server validates the complete solution**
- **If incorrect:** Simple message - "Not quite right. Keep trying!"
- **If correct:** Success! Show completion time and leaderboard rank
- **Timer keeps running** through all attempts (no penalties, just elapsed time)
- **Unlimited attempts** (no pressure, no "lives" system)

**Why This Approach:**
- Preserves pure challenge (you figure it out yourself)
- No frustration from artificial limits
- Timer incentivizes solving correctly the first time (but doesn't punish mistakes)
- Aligns with "respect the player" philosophy

**4. Completion Moment (The Magic):**

**Celebration Sequence:**
1. **Success animation** (simple, not over-the-top)
2. **Show completion time** prominently
3. **Reveal leaderboard rank** - "You're #347 globally!"
4. **One-tap share button** - "Share your result"
5. **Gentle auth prompt** for guest users - "Sign in to save your rank and start your streak!"

**Emotional Beat:**
This is the moment of pride - "I did this with MY brain." The UX amplifies that feeling.

**5. Emoji Grid Sharing:**

**Sharing Flow:**
- Tap "Share" button
- Preview emoji grid before sharing
- Choose channel: Twitter/X, WhatsApp, or Copy to clipboard
- One tap and it's shared

**Emoji Grid Format Example:**
```
Sudoku Daily #42
⏱️ 12:34

🟩⬜⬜🟨🟨⬜⬜⬜🟩
🟩🟩⬜⬜🟨🟨⬜⬜🟩
🟩🟩🟩⬜⬜🟨🟨⬜🟩

Play today's puzzle: [link]
```

**Emoji Legend:**
- 🟩 = Correct number on first fill
- 🟨 = Number changed/corrected during solve
- ⬜ = Pre-filled number (given clue)

**Why This Format Works:**
- Tells your solving journey without spoiling the puzzle
- Creates curiosity (what are those grids?)
- Shows skill (fewer changes = better solve)
- Drives clicks to site

**6. Leaderboard Interaction:**

**Design:**
- Clean, scannable list
- Shows: Rank | Username | Time
- Top 100 visible to all
- **Your rank always visible** (even if #5,432)
- Real-time updates with smooth animations (new completions slide in)

**Guest vs Authenticated:**
- **Guests:** See leaderboard, see "where you'd rank," can't claim position
- **Authenticated:** On leaderboard, username shown, rank saved

**7. Guest-to-Auth Conversion:**

**Strategy (Non-Intrusive):**
- **Never block core experience** - guests can play fully
- **Show what they're missing** after completion:
  - "You'd be #347! Sign in to claim your rank and start your streak"
- **Preserve progress** - session data saved retroactively upon auth
- **Seamless OAuth** - one click to Google/GitHub/Apple
- **No nagging** - gentle prompt once per session

**8. Timer Behavior:**

**Rules:**
- **Starts automatically** when puzzle loads
- **Runs continuously** through all submit attempts
- **Pauses if tab loses focus** (fair timing - prevents gaming the system)
- **Server tracks actual time** (client time is for display only, server validates)
- **No timer manipulation** - server-side source of truth

**Display:**
- Elapsed time shown clearly but not obtrusively
- Updates every second
- Format: MM:SS (e.g., 12:34)

### Design System Principles

**Typography Scale:**
- Display (48px+): Puzzle number, completion time
- Heading (24-32px): Section titles, "Today's Puzzle"
- Body (16-18px): Instructions, leaderboard entries
- UI (14px): Buttons, labels, secondary text

**Color Palette (Newspaper Aesthetic):**
- Primary: #000000 (black - text, grid)
- Background: #FFFFFF (white - clean canvas)
- Spot Color: #1a73e8 (blue - CTAs, highlights, links)
- Success: #0f9d58 (green - completion)
- Neutral: #757575 (gray - secondary text)

**Spacing System:**
- Based on 8px grid (8, 16, 24, 32, 40, 48...)
- Generous padding and margins
- Breathing room around grid and UI elements

**Component Design:**
- **Buttons:** Clear, high contrast, large tap targets (48px height minimum)
- **Grid cells:** Clearly defined borders, sufficient size for touch (40-48px)
- **Cards:** Subtle shadows, clean edges
- **Typography:** Readable at small sizes (16px minimum body text)

### Critical UX Decisions

**Q: What happens when player makes an error?**
**A:** Nothing during solve. On submit, simple message: "Not quite right. Keep trying!" Timer continues, unlimited attempts.

**Q: How should the timer work?**
**A:** Auto-start on load, pauses if tab loses focus, keeps running through retries, server validates actual time.

**Q: How does guest-to-auth feel?**
**A:** Never blocked. After completion, gentle prompt shows what they're missing (rank, streaks). One-click OAuth. Session preserved.

**Q: Should we show duplicate numbers in rows/columns as errors?**
**A:** No. No real-time validation during solve. Pure challenge - figure it out yourself, then submit for validation.

**Q: How do we prevent frustration from unlimited retries?**
**A:** Timer keeps running (incentivizes getting it right), but no penalties. Message is encouraging: "Keep trying!" not punishing.

---

## Functional Requirements

These requirements are organized by capability area. Each requirement connects to user value and includes specific acceptance criteria.

### 1. Daily Puzzle System

**FR-1.1: Daily Puzzle Generation & Delivery**

System generates or curates one medium-difficulty Sudoku puzzle per day. Puzzle refreshes at midnight UTC ensuring the same puzzle for all users globally.

**Acceptance Criteria:**
- Single puzzle served to all users on a given calendar day (UTC)
- Puzzle persists for 24 hours then rotates to new puzzle
- Difficulty rating system validates puzzle before deployment
- Average completion rate tracked and falls within 70-80% target
- Puzzle difficulty consistent (medium complexity)

**User Value:** Creates shared daily ritual and community experience ("everyone plays the same puzzle")

---

**FR-1.2: Puzzle State Management**

User's progress on current puzzle saved automatically for seamless experience.

**Acceptance Criteria:**
- Progress auto-saves on every cell input
- Guest users: session-based storage (browser localStorage)
- Authenticated users: database persistence
- State includes: filled cells, elapsed time, completion status
- Page refresh preserves complete puzzle state
- Auth users can resume puzzle on different devices

**User Value:** Never lose progress, can solve at own pace throughout the day

---

### 2. Solving Experience

**FR-2.1: Sudoku Grid Interface**

Display clean 9x9 grid optimized for both mobile and desktop interaction.

**Acceptance Criteria:**
- Grid renders correctly on all supported devices/browsers
- Mobile: Touch-optimized cell selection (44x44px minimum tap targets)
- Desktop: Click to select cell
- Pre-filled numbers (puzzle clues) are read-only and cannot be modified
- User-entered numbers are editable and clearly distinguished from clues
- Selected cell visually distinct with clear highlight
- Grid responsive across all breakpoints

**User Value:** Clear, easy-to-use interface enables focused solving without distractions

---

**FR-2.2: Number Input System**

Fast, intuitive number input optimized for each platform.

**Acceptance Criteria:**
- **Mobile:** Number pad (1-9) appears immediately when cell selected
- **Desktop:** Type numbers 1-9 directly OR click number palette
- Keyboard shortcuts: Arrow keys navigate grid, number keys input
- Backspace/Delete or "0" clears selected cell
- Number pad buttons: large tap targets (minimum 44x44px)
- Input responsive and immediate (no lag)

**User Value:** Fast, intuitive input method enables efficient solving flow

---

**FR-2.3: Solution Validation (Server-Side)**

Pure challenge approach with no real-time error checking during solve.

**Acceptance Criteria:**
- Player submits solution via "Submit" button when ready
- **NO real-time validation during solving** (no conflict highlighting)
- Server validates entire solution against correct answer
- Unlimited submission attempts allowed (no "lives" system)
- If incorrect: Encouraging message displayed ("Not quite right. Keep trying!")
- If correct: Trigger completion flow (show time, rank, sharing options)
- Timer continues running through all submission attempts
- Server-side validation prevents client-side manipulation

**User Value:** Pure challenge with no hand-holding preserves satisfaction of authentic solving. "I did this with MY brain."

---

### 3. Timer & Timing

**FR-3.1: Automatic Timer**

Fair, accurate timing system for competitive leaderboards.

**Acceptance Criteria:**
- Timer starts automatically when puzzle page loads
- Displays elapsed time in MM:SS format (e.g., 12:34)
- Updates every second
- Continues running through multiple submit attempts
- Pauses when browser tab loses focus (prevents gaming the system)
- Resumes when tab regains focus
- Server validates actual elapsed time (client display only, not source of truth)

**User Value:** Fair, accurate timing for competitive leaderboards with anti-cheat measures

---

**FR-3.2: Completion Time Recording**

Server-side time tracking as source of truth.

**Acceptance Criteria:**
- Server calculates actual solve time (total elapsed time until correct submission)
- Completion time immune to client-side manipulation
- Time displayed prominently on successful completion
- Time persisted to database for authenticated users
- Time used for leaderboard ranking (fastest first)
- Guest completion times calculated but not persisted

**User Value:** Authentic competitive metric for leaderboard ranking and personal progress tracking

---

### 4. Authentication & User Management

**FR-4.1: Guest Play (No Auth Required)**

Zero-friction guest experience enables viral growth.

**Acceptance Criteria:**
- No signup required to play puzzle (immediate access)
- Guest progress saved in browser session (localStorage)
- Guest can complete puzzle and see completion time
- Guest can view global leaderboard (but not ranked on it)
- Guest sees "where they'd rank" message after completion ("You'd be #347!")
- Gentle auth prompt after completion (non-blocking, once per session)
- No nagging or forced authentication

**User Value:** Zero friction to try product, enables viral growth through easy sharing

---

**FR-4.2: OAuth Authentication**

Seamless one-click authentication with session preservation.

**Acceptance Criteria:**
- Support OAuth providers: Google, GitHub, Apple
- One-click authentication flow (redirect to provider → return to site)
- Guest session data preserved and retroactively saved upon auth
  - Current puzzle progress migrated
  - Completion time saved
  - Session state preserved
- Seamless transition from guest to authenticated user (no data loss)
- User immediately sees their rank on leaderboard after auth

**User Value:** Easy authentication, no lost progress, immediate leaderboard access and streak tracking

---

**FR-4.3: User Profile & Account Management**

Persistent user identity and progress tracking.

**Acceptance Criteria:**
- Store user data: username, email, OAuth provider ID
- Username extracted from OAuth provider or user can customize
- Display username on leaderboard and profile
- Profile page displays: total puzzles solved, current streak, longest streak, average time, best time
- Logout functionality clears session and returns to guest state
- User can delete account (GDPR compliance)

**User Value:** Persistent identity across sessions, track progress over time, competitive leaderboard presence

---

### 5. Leaderboard System

**FR-5.1: Global Daily Leaderboard**

Real-time competitive ranking for today's puzzle.

**Acceptance Criteria:**
- Shows top 100 players for today's puzzle
- Displays: rank (#1, #2...), username, completion time
- Real-time updates as players complete puzzle (<1 second latency)
- Always shows user's personal rank even if outside top 100 (e.g., "You're #347!")
- Sorted by completion time (fastest first)
- Ties broken by submission timestamp (earlier submission ranks higher)
- Leaderboard resets daily at midnight UTC with new puzzle
- Smooth animations for new entries (no jarring updates)

**User Value:** Competitive motivation, social proof, sense of community around shared challenge

---

**FR-5.2: Leaderboard Anti-Cheat Measures**

Preserve competitive integrity (core differentiator).

**Acceptance Criteria:**
- Only authenticated users can appear on leaderboard (claim rank)
- Server-side time validation prevents client manipulation
- Suspiciously fast times flagged for review (threshold: <2 minutes)
- Ability to report suspicious entries (authenticated users)
- Admin review system for flagged entries
- Cheaters removed from leaderboard

**User Value:** Preserves competitive integrity and leaderboard authenticity. "No hints" policy means rankings are authentic.

---

### 6. Streak Tracking

**FR-6.1: Consecutive Day Streaks**

Daily habit formation through streak mechanics.

**Acceptance Criteria:**
- Track consecutive days user completes puzzle
- Authenticated users only (guests cannot track streaks)
- Display current streak and longest streak (all-time)
- Streak increments when puzzle completed (one completion per day counts)
- Completing multiple times same day doesn't increment
- Streak displayed on profile and in post-completion UI
- Longest streak saved permanently

**User Value:** Habit formation, sense of accomplishment, daily ritual reinforcement, motivation to return

---

**FR-6.2: Streak Freeze Mechanic (Healthy Engagement)**

Prevent toxic compulsion while maintaining engagement.

**Acceptance Criteria:**
- Allow 1 missed day per 7-day rolling period without breaking streak
- Missing 2+ days in any 7-day period breaks streak (resets to 0)
- User sees "Streak Freeze Active" indicator when protection in use
- Streak freeze availability communicated clearly
- System tracks freeze usage automatically
- Positive messaging around streaks (not punishing)

**User Value:** Reduces anxiety, healthier engagement pattern, forgiveness for life events without losing long streaks

---

### 7. Social Sharing (Primary Growth Engine)

**FR-7.1: Emoji Grid Generation**

Visual representation of solve journey that doesn't spoil puzzle.

**Acceptance Criteria:**
- Generate emoji grid showing solve path for sharing
- Format defined:
  - 🟩 = Correct number on first fill (never changed)
  - 🟨 = Number changed/corrected during solve (modified at least once)
  - ⬜ = Pre-filled number (given clue from puzzle)
- Include puzzle number (e.g., "Sudoku Daily #42")
- Include completion time (e.g., "⏱️ 12:34")
- Include shareable link to site
- Preview grid before sharing (user sees what will be shared)
- Grid accurately represents actual solve path (tracked during solve)

**User Value:** Share accomplishment without spoiling puzzle for friends, tell your solving story, drive viral growth

---

**FR-7.2: One-Tap Sharing**

Effortless sharing across multiple channels.

**Acceptance Criteria:**
- Share to Twitter/X (native share or web intent)
- Share to WhatsApp (opens WhatsApp with pre-filled message)
- Copy to clipboard (copies full formatted message)
- Share button prominent in post-completion UI
- Single tap/click to share (minimal friction)
- All sharing options work on both mobile and desktop
- Shared content includes: emoji grid, time, puzzle number, link

**Format Example:**
```
Sudoku Daily #42
⏱️ 12:34

🟩⬜⬜🟨🟨⬜⬜⬜🟩
🟩🟩⬜⬜🟨🟨⬜⬜🟩
🟩🟩🟩⬜⬜🟨🟨⬜🟩

Play today's puzzle: [link]
```

**User Value:** Effortless sharing drives viral growth. This is the primary growth engine modeled after Wordle's success.

---

### 8. Statistics & Progress Tracking

**FR-8.1: Personal Statistics (Authenticated Users)**

Track improvement and progress over time.

**Acceptance Criteria:**
- **Total puzzles solved** (lifetime count)
- **Current streak** (consecutive days with completion)
- **Longest streak** (all-time best)
- **Average completion time** (mean across all completions)
- **Best time** (personal record - fastest completion)
- **Completion history** (calendar view showing which days completed)
- Stats update in real-time on puzzle completion
- Stats display on profile page
- Historical completion data accessible
- Stats persist across devices for authenticated users
- Stats not available for guest users (auth incentive)

**User Value:** Track improvement over time, motivation to continue playing, sense of progress and mastery

---

### Requirements Summary

**Total Functional Requirements: 16**
- Daily Puzzle System: 2
- Solving Experience: 3
- Timer & Timing: 2
- Authentication & User Management: 3
- Leaderboard System: 2
- Streak Tracking: 2
- Social Sharing: 2
- Statistics & Progress: 1

**Critical Path Requirements (MVP Must-Haves):**
All 16 functional requirements are MVP requirements. Each one supports the core value proposition:
- Pure competitive integrity (no hints)
- Daily ritual format (one puzzle per day)
- Viral social mechanics (emoji sharing)
- Authentic challenge (respects player intelligence)

---

## Non-Functional Requirements

These NFRs focus only on what matters for THIS product. We skip categories that don't apply.

### Performance (Critical - Daily Habit Depends On It)

**Why Performance Matters:**
Research shows 17+ minutes average daily engagement happens on mobile. Slow loads kill daily habits. Players want to jump into their morning puzzle ritual immediately.

**Performance Requirements:**

**Page Load Performance:**
- **Initial Page Load: <2 seconds** (on standard broadband)
- **Time to Interactive (TTI): <3 seconds**
- **Lighthouse Performance Score: >90**
- **First Contentful Paint (FCP): <1 second**
- **Largest Contentful Paint (LCP): <2.5 seconds**

**Runtime Performance:**
- **Leaderboard Query: <1 second** latency
- **Real-time updates: <1 second** for new leaderboard entries
- **Puzzle state save: <100ms** (auto-save on cell input)
- **Smooth 60fps interactions** (grid interactions, animations)

**Mobile Performance:**
- Smooth performance on 3-5 year old devices
- Fast on 3G/4G networks (not just WiFi)
- Minimal JavaScript bundle size (<200KB gzipped)
- Lazy load non-critical resources
- Optimize images and assets

**Acceptance Criteria:**
- Lighthouse performance audit passes >90 score
- Real user monitoring (RUM) shows <2s average load time
- No performance regressions in CI/CD pipeline
- Mobile performance tested on mid-range devices

---

### Security (Critical - User Data & Competitive Integrity)

**Why Security Matters:**
Handling user accounts and preventing cheating preserves competitive integrity (our core differentiator). "No hints" only works if leaderboards are authentic.

**Security Requirements:**

**Authentication Security:**
- Secure OAuth 2.0 implementation (Google, GitHub, Apple)
- No password storage (OAuth only)
- Secure session management (HttpOnly, Secure, SameSite cookies)
- Session tokens rotated regularly
- Auto-logout after period of inactivity

**Anti-Cheat & Competitive Integrity:**
- **Server-side validation:** All solution checking happens on server (prevent client manipulation)
- **Server-side timing:** Client displays time, server validates actual elapsed time
- **Anomaly detection:** Flag suspiciously fast times (<2 minutes threshold)
- **Rate limiting:** Prevent automated submissions and brute-force attempts
- **Input validation:** Sanitize all user inputs server-side

**Data Security:**
- **Encryption in transit:** HTTPS only (TLS 1.3+), all traffic encrypted
- **Encryption at rest:** Database encryption (Supabase default)
- **Secure headers:** CSP, HSTS, X-Frame-Options, etc.
- **No sensitive data in localStorage:** Only non-sensitive session state
- **API security:** Authentication required for sensitive endpoints

**Privacy & Compliance:**
- **GDPR compliance:** User can delete account and all associated data
- **Data minimization:** Only collect data necessary for functionality
- **Clear privacy policy:** What data is collected and why
- **Data retention policy:** Define how long data is kept
- **No tracking without consent:** Respect user privacy

**Acceptance Criteria:**
- Security audit passes (automated tools: OWASP ZAP, etc.)
- OAuth flows tested and secure
- Server-side validation for all critical operations
- Rate limiting tested and enforced
- GDPR deletion workflow implemented and tested

---

### Scalability (Important - Growth Expected)

**Why Scalability Matters:**
Plan is to grow from 10 → 1,000+ daily active users organically via viral growth. Need to scale without performance degradation.

**Scalability Requirements:**

**Concurrent User Support:**
- **MVP (Months 1-3):** Support 100+ concurrent users without degradation
- **Growth (Months 4-9):** Scale to 1,000+ concurrent users
- **Scale (Months 10+):** Support 10,000+ concurrent users

**Database Scalability:**
- Efficient leaderboard queries (indexed by puzzle_id, completion_time)
- Connection pooling to manage database connections
- Query optimization (N+1 prevention, proper indexing)
- Supabase free tier sufficient for MVP:
  - 500 MB database storage
  - 100 GB bandwidth
  - Unlimited API requests

**Architecture Scalability:**
- Serverless architecture (Next.js API routes on Vercel)
- Auto-scaling based on traffic (Vercel handles this)
- CDN for static assets (Vercel Edge Network)
- Real-time subscriptions scale with Supabase (WebSockets)

**Caching Strategy:**
- Static puzzle data cached (1 day TTL)
- Leaderboard data: short cache (5-10 seconds) or real-time
- User profile data: cached with invalidation on update
- CDN caching for assets (images, CSS, JS)

**Growth Thresholds & Monitoring:**
- Monitor database size and upgrade before 80% capacity
- Monitor bandwidth usage
- Monitor API request patterns
- Alert on abnormal traffic spikes

**Acceptance Criteria:**
- Load testing validates 100+ concurrent users (MVP)
- Database queries optimized (execution time <100ms for critical paths)
- Caching strategy implemented
- Monitoring alerts configured
- Upgrade path documented (free → paid tiers)

---

### Reliability & Availability

**Why Reliability Matters:**
Daily ritual breaks if site is down during morning routine (peak usage time). Missing a puzzle day frustrates users and breaks streaks.

**Reliability Requirements:**

**Uptime:**
- **Target uptime: >99.5%** (acceptable for MVP on free/hobby tier)
- **Vercel SLA:** 99.99% uptime on paid plans (upgrade as needed)
- **Planned maintenance:** Only during low-traffic hours (announce in advance)

**Daily Puzzle Delivery (Mission-Critical):**
- Daily puzzle MUST be available at midnight UTC
- Automated puzzle rotation (no manual intervention required)
- Fallback puzzle if primary fails
- Monitor puzzle availability (alert if missing)

**Error Handling & Graceful Degradation:**
- If real-time leaderboard fails → fallback to polling
- If database query slow → show cached data with staleness indicator
- User progress auto-saves → if save fails, retry with exponential backoff
- Clear error messages (never expose stack traces to users)

**Data Persistence & Backups:**
- User progress NEVER lost (auto-save + database persistence)
- Daily automated database backups (Supabase automatic)
- Point-in-time recovery capability
- Backup retention: 7 days minimum

**Monitoring & Alerting:**
- Uptime monitoring (Vercel built-in + third-party like UptimeRobot)
- Error tracking (Sentry or similar)
- Performance monitoring (Core Web Vitals)
- Alert on critical failures (email/SMS to developer)
- Daily puzzle availability check

**Acceptance Criteria:**
- Uptime monitoring configured with alerts
- Error tracking service integrated
- Graceful degradation tested for all failure modes
- Database backups validated (restore test performed)
- Monitoring dashboard accessible

---

### Accessibility (WCAG 2.1 Level AA)

**Why Accessibility Matters:**
Broadens audience reach, improves usability for everyone, and aligns with "respecting the player" philosophy.

**Accessibility Requirements:**
(These were detailed in Web Application Specific Requirements section)

- Keyboard navigation (arrow keys, number keys, tab)
- Screen reader support (semantic HTML, ARIA labels)
- Sufficient color contrast (WCAG AA standards)
- Focus indicators for keyboard users
- Accessible error messages and form validation
- Text sizing and zoom support (up to 200%)

**Acceptance Criteria:**
- WAVE accessibility audit passes with 0 errors
- Keyboard-only navigation tested
- Screen reader tested (NVDA/JAWS on Windows, VoiceOver on Mac/iOS)
- Color contrast ratios meet WCAG AA (4.5:1 for text, 3:1 for UI)

---

### NFR Summary

**Included NFRs (What Matters for This Product):**
1. **Performance** - Critical (daily habit depends on fast loads)
2. **Security** - Critical (user data + competitive integrity)
3. **Scalability** - Important (organic growth expected)
4. **Reliability** - Important (daily ritual can't break)
5. **Accessibility** - Important (broader reach, better UX)

**Excluded NFRs (Not Relevant for MVP):**
- **Internationalization** - English-only for MVP (Phase 2+)
- **Integration** - No external system integrations at MVP
- **Compliance** - No complex regulatory requirements (general domain)
- **Advanced Analytics** - Basic analytics sufficient for MVP

**Critical NFR Path:**
Performance + Security + Reliability must be rock-solid for MVP. These three preserve:
- Daily ritual (performance)
- Competitive integrity (security)
- User trust (reliability)

---

## References

This PRD was built on comprehensive foundational research and discovery work:

### Input Documents

**Product Brief:**
- File: `docs/product-brief-sudoku-race-2025-11-08.md`
- Created: November 8, 2025
- Summary: Comprehensive product vision defining Sudoku Daily as a pure, authentic daily Sudoku platform applying Wordle's viral mechanics to puzzle purists. Includes success metrics, MVP scope, and competitive positioning.

**Market Research:**
- File: `docs/research-market-2025-11-08.md`
- Created: November 8, 2025
- Summary: Deep research on viral mechanics (Wordle case study: 90 → 2M users in 2 months), competitive landscape (NYT Games, Sudoku.com, Good Sudoku), and market opportunity (50M daily puzzle players). Validates emoji sharing as primary growth engine.

### Key Research Findings

**Market Validation:**
- 50M daily puzzle players (NYT Games alone)
- Wordle's viral growth: 90 → 2M users in 2 months after adding emoji sharing feature
- Puzzle game market: $23B projected revenue (2025)
- Clear market gap: No free daily Sudoku with viral social mechanics

**Critical Success Factors (Research-Backed):**
- Emoji grid sharing drives 60-70% of growth (Wordle model)
- Players connected to social groups are 2.5x more likely to become long-term gamers
- Medium difficulty calibration: Target 70-80% completion rate
- Mobile-first critical: 17+ minutes average daily engagement on mobile
- Streak mechanics drive retention (69% of successful puzzle games use them)

**Competitive Positioning:**
- NYT Games: Premium subscription ($50/year), massive scale but not Sudoku-focused
- Sudoku.com: Dominant free Sudoku but no daily scarcity or social features
- Good Sudoku: Daily + leaderboards but paid ($5-7) and has AI hints
- **Our Gap:** Free + Social + Pure Competition = Unique positioning

### Strategic Insights

**Core Differentiator:**
Pure competitive integrity (no AI hints) preserves leaderboard authenticity and makes sharing meaningful. When players share "I did this with MY brain," that's authentic and drives pride-based sharing.

**Product Magic:**
The special moment when someone completes a puzzle knowing they solved it themselves, then shares that accomplishment with a community that values authentic challenge.

**Growth Model:**
Viral social sharing (emoji grids) as primary growth engine, modeled after Wordle's proven mechanics. Expected 60-70% of growth from sharing, 20-25% from SEO, 10-15% word-of-mouth.

---

## Next Steps

### After PRD Approval

**1. Epic & Story Breakdown (Required)**

Run: `/bmad:bmm:workflows:create-epics-and-stories`

This workflow will:
- Decompose all PRD requirements into implementable epics
- Break epics into bite-sized stories (200k context limit for dev agents)
- Create epic-level technical specifications
- Establish story dependencies and sequencing

**2. UX Design (Conditional - If UI Refinement Needed)**

Run: `/bmad:bmm:workflows:create-design`

This workflow will:
- Design detailed UI mockups for newspaper aesthetic
- Create interaction prototypes for mobile/desktop
- Define component library and design system
- Validate emoji sharing format

**3. Architecture (Recommended)**

Run: `/bmad:bmm:workflows:create-architecture`

This workflow will:
- Define technical architecture for Next.js/Supabase stack
- Create database schema (users, puzzles, completions, leaderboards)
- Design API endpoints and data flow
- Plan real-time leaderboard architecture
- Define anti-cheat and server-side validation approach

**4. Solutioning Gate Check (Required Before Implementation)**

Run: `/bmad:bmm:workflows:solutioning-gate-check`

This validates PRD + Architecture + Epics/Stories are cohesive before coding begins.

---

## Document Summary

**Created:** November 8, 2025
**Author:** Spardutti (Product Manager)
**Project:** sudoku-race (Sudoku Daily)
**Type:** Web Application (Next.js 16 / React 19 + Supabase)
**Complexity:** Medium (greenfield SaaS)

**PRD Completeness:**
- ✅ Executive Summary & Product Magic
- ✅ Success Criteria (10 users → 1,000 users)
- ✅ Product Scope (MVP / Growth / Vision)
- ✅ Project Classification (Web App, General Domain)
- ✅ Web App Specific Requirements
- ✅ UX Principles (Newspaper Aesthetic, Pure Challenge)
- ✅ Functional Requirements (16 requirements across 8 capability areas)
- ✅ Non-Functional Requirements (Performance, Security, Scalability, Reliability, Accessibility)
- ✅ References (Product Brief, Market Research)

**Total Requirements:**
- Functional Requirements: 16
- Non-Functional Requirements: 5 categories
- All requirements include acceptance criteria and user value

**Ready for:** Epic breakdown and architecture design

---

_The magic of Sudoku Daily - "I did this with MY brain" - is woven throughout every requirement in this PRD._

_Created through the BMad Method PRD workflow with collaborative discovery between Spardutti and AI Product Manager._
