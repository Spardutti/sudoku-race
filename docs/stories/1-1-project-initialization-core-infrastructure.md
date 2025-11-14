# Story 1.1: Project Initialization & Core Infrastructure

Status: ready-for-dev
Epic: Epic 1 - Foundation & Infrastructure
Date Created: 2025-11-14

## Story

As a **developer**,
I want a **fully configured Next.js 16 project with TypeScript, deployment pipeline, and core dependencies**,
so that I can **build features on a solid foundation with rapid deployment capabilities**.

## Acceptance Criteria

### AC-1.1.1: Next.js Project Configuration
- [ ] Next.js 16 project initialized with React 19
- [ ] TypeScript strict mode enabled (`tsconfig.json`)
- [ ] Tailwind CSS 4 installed and configured
- [ ] ESLint and Prettier configured with Next.js recommended rules
- [ ] Git repository initialized with `.gitignore` configured

### AC-1.1.2: Environment Management
- [ ] `.env.local` file created with Supabase placeholders
- [ ] `.env.local` added to `.gitignore`
- [ ] Environment variable documentation in README

### AC-1.1.3: Vercel Deployment
- [ ] Project connected to Vercel
- [ ] Automatic deployments on push to main branch
- [ ] Preview deployments for feature branches
- [ ] Environment variables configured in Vercel dashboard

### AC-1.1.4: Project Structure
- [ ] Directory structure created:
  - `/app` - Next.js App Router
  - `/components` - React components
  - `/lib` - Utility functions
  - `/types` - TypeScript definitions
  - `/public` - Static assets

### AC-1.1.5: Hello World Deployment
- [ ] Basic "Hello World" page renders at `/`
- [ ] Page successfully deployed to Vercel production
- [ ] Production URL accessible and loads correctly

## Tasks / Subtasks

### Task 1: Initialize Next.js 16 Project (AC: 1.1.1, 1.1.4)
- [ ] Run `npx create-next-app@latest sudoku-race` with options:
  - TypeScript: Yes
  - ESLint: Yes
  - Tailwind CSS: Yes
  - App Router: Yes (NOT Pages Router)
  - Import alias: `@/*`
- [ ] Verify Next.js 16 and React 19 versions in `package.json`
- [ ] Enable TypeScript strict mode in `tsconfig.json`
- [ ] Create directory structure: `/components`, `/lib`, `/types`, `/public`
- [ ] Initialize Git repository with `git init`
- [ ] Create/verify `.gitignore` includes `node_modules/`, `.next/`, `.env*.local`

### Task 2: Configure Code Quality Tools (AC: 1.1.1)
- [ ] Configure ESLint with Next.js recommended rules
  - Verify `.eslintrc.json` exists with Next.js config
  - Add strict rules for TypeScript
- [ ] Install and configure Prettier
  - Create `.prettierrc` with formatting rules
  - Add `prettier` to dev dependencies
  - Configure Prettier-ESLint integration
- [ ] Add npm scripts for linting and formatting
  - `npm run lint` - Run ESLint
  - `npm run format` - Run Prettier

### Task 3: Configure Tailwind CSS 4 (AC: 1.1.1)
- [ ] Verify Tailwind CSS 4 installed (check `package.json`)
- [ ] Create `tailwind.config.ts` with newspaper aesthetic preparation:
  - Set up theme extension structure
  - Configure content paths: `['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}']`
  - Add newspaper color placeholders (to be detailed in Story 1.5)
- [ ] Verify Tailwind directives in global CSS (`app/globals.css`)

### Task 4: Set Up Environment Variables (AC: 1.1.2)
- [ ] Create `.env.local` file with Supabase placeholders:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- [ ] Verify `.env*.local` in `.gitignore`
- [ ] Create README.md with environment setup instructions:
  - List required environment variables
  - Document how to obtain Supabase credentials (Story 1.2)
  - Include setup steps for new developers

### Task 5: Deploy to Vercel (AC: 1.1.3, 1.1.5)
- [ ] Create "Hello World" page at `/app/page.tsx`:
  - Simple page with "Hello World" heading
  - Use newspaper aesthetic styling (basic black text, serif font)
  - Include project name "Sudoku Daily"
- [ ] Commit initial code to Git
  - `git add .`
  - `git commit -m "Initial Next.js 16 project setup"`
- [ ] Create GitHub repository and push code
  - Create repo: `sudoku-race`
  - Add remote origin
  - Push main branch
- [ ] Connect project to Vercel:
  - Log in to Vercel dashboard
  - Import GitHub repository
  - Configure automatic deployments (main → production)
  - Enable preview deployments for branches
- [ ] Add environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL` (placeholder for now)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (placeholder for now)
- [ ] Verify deployment:
  - Check production URL loads "Hello World" page
  - Test page renders correctly on mobile (320px width)
  - Verify no console errors

### Task 6: Verification & Documentation (AC: All)
- [ ] Test entire setup locally:
  - `npm install` - Dependencies install without errors
  - `npm run dev` - Dev server starts successfully
  - `npm run lint` - Linting passes
  - `npm run build` - Production build succeeds
- [ ] Verify TypeScript strict mode enforced (compile errors for type issues)
- [ ] Document setup in README.md:
  - Project description
  - Tech stack (Next.js 16, React 19, TypeScript, Tailwind CSS 4)
  - Setup instructions
  - Deployment info (Vercel URL)
- [ ] Create initial commit with complete setup

## Dev Notes

### Architecture Alignment

This story implements the foundational architecture decisions from `docs/architecture.md` and `docs/tech-spec-epic-1.md`:

**Frontend Architecture (Section 2.1):**
- Next.js 16 App Router (NOT Pages Router) for React Server Components support
- TypeScript strict mode for type safety and better IDE support
- Tailwind CSS 4 for utility-first styling with newspaper aesthetic theme

**Deployment Architecture (Section 3.0):**
- Vercel for hosting with automatic deployments (Progressive Deployment pattern)
- Edge network CDN for global static asset delivery
- Environment variables managed via Vercel dashboard (secure credential management)

**Quality Standards:**
- ESLint + Prettier for code quality and consistency
- TypeScript strict mode eliminates entire classes of bugs
- Git + GitHub for version control and collaboration

### Project Structure Notes

**Directory Organization:**
```
/app                    # Next.js 16 App Router (entry point)
  /layout.tsx          # Root layout (created in Story 1.3)
  /page.tsx            # Home page - "Hello World" for Story 1.1, puzzle page in Epic 2
  /globals.css         # Global styles with Tailwind directives

/components            # React components (populated in Stories 1.3, 1.5)
  /layout/             # Header, Footer (Story 1.3)
  /ui/                 # Design system components (Story 1.5)

/lib                   # Utility functions and shared logic
  /supabase.ts         # Supabase client (Story 1.2)
  /design-tokens.ts    # Design system tokens (Story 1.5)
  /utils.ts            # Helper functions

/types                 # TypeScript type definitions
  /database.ts         # Supabase auto-generated types (Story 1.2)
  /index.ts            # Application-wide types

/public                # Static assets
  /fonts/              # Custom fonts (Story 1.5)
  /images/             # Logos, OG images

/docs                  # Project documentation (PRD, architecture, tech specs)
```

**Configuration Files:**
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS theme and content paths
- `tsconfig.json` - TypeScript compiler options (strict mode ON)
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `.gitignore` - Git exclusions (includes `.env*.local`, `node_modules/`, `.next/`)
- `package.json` - Dependencies and scripts

### Key Technical Decisions

**Why Next.js 16 App Router?**
- React Server Components reduce client-side JavaScript bundle size
- Built-in data fetching and caching optimizations
- Better performance for mobile-first approach (target: 3G load times <2.5s)
- Server-side rendering improves SEO and initial page load

**Why TypeScript Strict Mode?**
- Catches errors at compile time, not runtime
- Better IDE autocomplete and refactoring support
- Documents code through type signatures
- Essential for AI agent development (clearer contracts)

**Why Tailwind CSS 4?**
- Utility-first approach speeds up development
- Excellent purging (small production CSS bundle)
- Easy to implement newspaper aesthetic with custom theme
- Mobile-first responsive design built-in

**Why Vercel?**
- Zero-config deployment for Next.js (same creators)
- Automatic preview deployments for PRs (test before merge)
- Edge network for fast global delivery
- Free tier sufficient for MVP (100GB bandwidth/month)

### Testing Standards

**For Story 1.1 (No Tests Required):**
- This is infrastructure setup, not feature code
- Manual verification sufficient (deployment works, build succeeds)
- Testing infrastructure added in Story 1.4

**Quality Checklist:**
- [ ] `npm run build` succeeds without errors
- [ ] `npm run lint` passes with no errors
- [ ] TypeScript compiles with strict mode (no type errors)
- [ ] Production deployment accessible and renders correctly
- [ ] No console errors in browser DevTools

### Prerequisites

**None** - This is the first story in Epic 1 (foundation starter)

### Dependencies for Future Stories

This story establishes the foundation that all subsequent stories depend on:
- **Story 1.2** requires environment variables structure and `/lib` directory
- **Story 1.3** requires `/app` directory and routing structure
- **Story 1.4** requires `package.json` for adding test dependencies
- **Story 1.5** requires Tailwind CSS configuration for design system

### References

- [Source: docs/tech-spec-epic-1.md#Acceptance-Criteria]
- [Source: docs/epics.md#Story-1.1]
- [Source: docs/architecture.md#Section-2.1-Frontend-Architecture]
- [Source: docs/architecture.md#Section-3.0-Deployment-Architecture]
- [Source: docs/PRD.md#Technical-Requirements]

### Success Metrics

- Production URL accessible within 2 seconds on 3G connection
- Build completes in <2 minutes
- Lighthouse performance score >90 (baseline for future features)
- Zero console errors in production deployment

## Dev Agent Record

### Context Reference

- `docs/stories/1-1-project-initialization-core-infrastructure.context.xml`

### Agent Model Used

<!-- To be filled by dev agent during implementation -->

### Debug Log References

<!-- Dev agent logs go here during implementation -->

### Completion Notes List

<!-- Dev agent completion notes go here after implementation -->

### File List

<!-- Files created/modified/deleted listed here by dev agent -->
