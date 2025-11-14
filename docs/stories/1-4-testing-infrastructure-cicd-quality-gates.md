# Story 1.4: Testing Infrastructure & CI/CD Quality Gates

Status: drafted
Epic: Epic 1 - Foundation & Infrastructure
Date Created: 2025-11-14

## Story

As a **developer**,
I want **automated testing and CI/CD quality gates**,
So that I can **catch bugs early and maintain code quality as the project scales**.

## Acceptance Criteria

### AC-1.4.1: Test Framework Configuration
- [ ] Jest installed and configured
- [ ] React Testing Library installed
- [ ] `jest.config.js` created with coverage thresholds (70%)
- [ ] Test environment set to jsdom
- [ ] Coverage collection configured for:
  - `app/**/*.{ts,tsx}`
  - `components/**/*.{ts,tsx}`
  - `lib/**/*.{ts,tsx}`
  - Excluding: `**/*.test.{ts,tsx}`, `**/*.config.ts`

### AC-1.4.2: NPM Scripts
- [ ] `npm test` - Run all unit tests
- [ ] `npm run test:watch` - Watch mode for development
- [ ] `npm run test:coverage` - Generate coverage report
- [ ] `npm run lint` - ESLint check
- [ ] `npm run format` - Prettier format (optional)

### AC-1.4.3: GitHub Actions Workflow
- [ ] `.github/workflows/ci.yml` created
- [ ] Runs on every PR and push to main
- [ ] Executes: `npm run lint`, `npm test`, `npm run build`
- [ ] Blocks merge if any step fails
- [ ] Runs steps in parallel for speed where possible

### AC-1.4.4: Example Tests
- [ ] Unit test for utility function (`lib/utils.ts` cn helper)
- [ ] Component test for Button (shadcn/ui)
- [ ] All tests pass in CI/CD pipeline

### AC-1.4.5: Coverage Threshold
- [ ] Coverage threshold configured (70% minimum)
- [ ] Coverage report excludes test files and config files
- [ ] Coverage report generated in `coverage/` directory
- [ ] CI fails if coverage below threshold

## Tasks / Subtasks

### Task 1: Install and Configure Jest + React Testing Library (AC: 1.4.1, 1.4.2)
- [ ] Install dependencies
  - [ ] `npm install --save-dev jest @types/jest jest-environment-jsdom`
  - [ ] `npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event`
  - [ ] `npm install --save-dev @testing-library/dom`
- [ ] Create `jest.config.js` in project root
  - [ ] Set `preset: 'next/jest'` (uses Next.js Jest configuration)
  - [ ] Set `testEnvironment: 'jest-environment-jsdom'`
  - [ ] Configure `collectCoverageFrom` array (app, components, lib)
  - [ ] Set `coverageThreshold` to 70% for lines, statements, functions, branches
  - [ ] Add `moduleNameMapper` for path aliases (`@/*`)
  - [ ] Configure `setupFilesAfterEnv` for jest-dom
- [ ] Create `jest.setup.js` for global test setup
  - [ ] Import `@testing-library/jest-dom` for custom matchers
- [ ] Add npm scripts to `package.json`
  - [ ] `"test": "jest"`
  - [ ] `"test:watch": "jest --watch"`
  - [ ] `"test:coverage": "jest --coverage"`

### Task 2: Create Example Unit Test for Utility Function (AC: 1.4.4)
- [ ] Create `lib/utils.test.ts`
  - [ ] Import `cn` function from `lib/utils.ts`
  - [ ] Write test: "merges class names correctly"
  - [ ] Write test: "handles conditional classes"
  - [ ] Write test: "removes conflicting Tailwind classes"
- [ ] Run tests locally: `npm test`
- [ ] Verify tests pass
- [ ] Verify coverage report generated

### Task 3: Create Example Component Test for Button (AC: 1.4.4)
- [ ] Create `components/ui/button.test.tsx`
  - [ ] Import `render`, `screen` from `@testing-library/react`
  - [ ] Import `Button` component
  - [ ] Write test: "renders with default props"
  - [ ] Write test: "applies variant className correctly"
  - [ ] Write test: "handles onClick event"
  - [ ] Write test: "is keyboard accessible (Tab, Enter)"
- [ ] Run tests locally: `npm test`
- [ ] Verify all tests pass
- [ ] Check coverage report shows >70% for Button component

### Task 4: Configure ESLint and Prettier Scripts (AC: 1.4.2)
- [ ] Verify `npm run lint` works (already configured by Next.js)
- [ ] Optional: Install Prettier
  - [ ] `npm install --save-dev prettier`
  - [ ] Create `.prettierrc` config file
  - [ ] Add `"format": "prettier --write ."` to package.json
  - [ ] Add `"format:check": "prettier --check ."` to package.json
- [ ] Test linting: `npm run lint`
- [ ] Test formatting (if Prettier installed): `npm run format`

### Task 5: Create GitHub Actions CI Workflow (AC: 1.4.3)
- [ ] Create `.github/workflows/ci.yml` file
  - [ ] Set trigger: `on: [push, pull_request]`
  - [ ] Define job: `quality` running on `ubuntu-latest`
  - [ ] Add steps:
    - [ ] Checkout code (`actions/checkout@v4`)
    - [ ] Setup Node.js 20 (`actions/setup-node@v4`)
    - [ ] Install dependencies (`npm ci`)
    - [ ] Run lint (`npm run lint`)
    - [ ] Run tests with coverage (`npm test -- --coverage`)
    - [ ] Run build (`npm run build`)
  - [ ] Configure steps to run in sequence (lint → test → build)
- [ ] Commit and push workflow file
- [ ] Verify workflow runs on GitHub Actions
- [ ] Verify all steps pass

### Task 6: Verify Coverage Threshold and CI Integration (AC: 1.4.5)
- [ ] Run `npm run test:coverage` locally
- [ ] Verify coverage report generated in `coverage/` directory
- [ ] Open `coverage/lcov-report/index.html` in browser
- [ ] Verify overall coverage is ≥70%
- [ ] Verify coverage excludes:
  - [ ] Test files (`*.test.ts`, `*.test.tsx`)
  - [ ] Config files (`*.config.js`, `*.config.ts`)
- [ ] Add `coverage/` to `.gitignore` (don't commit coverage reports)
- [ ] Test CI failure: temporarily lower threshold to 100% and verify CI fails
- [ ] Restore threshold to 70% and verify CI passes

### Task 7: Document Testing Patterns (AC: 1.4.4)
- [ ] Add comments to example tests showing best practices
  - [ ] How to test utility functions (pure functions)
  - [ ] How to test React components (render, screen, fireEvent)
  - [ ] How to use jest-dom matchers (toBeInTheDocument, toHaveClass)
  - [ ] How to test accessibility (keyboard navigation)
- [ ] Optional: Create `docs/testing-guide.md` with:
  - [ ] Testing philosophy (70% coverage target)
  - [ ] How to write unit tests
  - [ ] How to write component tests
  - [ ] How to run tests locally
  - [ ] How to debug failing tests

## Dev Notes

### Architecture Alignment

This story implements the testing infrastructure defined in `docs/architecture.md` and `docs/tech-spec-epic-1.md`:

**Testing Strategy (Architecture Section: Testing Strategy):**
- ✅ Jest + React Testing Library for unit/integration tests
- ✅ 70% overall coverage target (70% unit tests in testing pyramid)
- ✅ CI/CD via GitHub Actions running on every PR
- ✅ Playwright configured (defer E2E tests to Epic 2)

**Test Framework Configuration (Tech Spec AC-1.4.1):**
- ✅ Jest with `jest-environment-jsdom` for React component testing
- ✅ React Testing Library for component testing (test behavior, not implementation)
- ✅ Coverage thresholds: 70% minimum for lines, statements, functions, branches
- ✅ Coverage collection configured for app, components, lib directories

**GitHub Actions CI Pipeline (Tech Spec AC-1.4.3):**
- ✅ Runs on push and pull_request events
- ✅ Executes lint, test, build in sequence
- ✅ Blocks merge if any step fails (quality gate)
- ✅ Uses Node.js 20 (required by Next.js 16)

### Project Structure Notes

**New Files Created:**
```
/jest.config.js                   # Jest configuration
/jest.setup.js                    # Jest global setup (jest-dom)
/.github/workflows/ci.yml         # GitHub Actions CI workflow
/lib/utils.test.ts                # Example utility function test
/components/ui/button.test.tsx    # Example component test
/coverage/                        # Coverage reports (gitignored)
```

**Testing Infrastructure:**
- Jest configuration uses Next.js preset (`next/jest`) for automatic Next.js support
- jsdom environment simulates browser DOM for React component testing
- Path alias mapping (`@/*`) configured in jest.config.js
- Coverage reports generated in `coverage/` directory (HTML and LCOV formats)

**CI/CD Pipeline:**
- GitHub Actions free tier: 2,000 minutes/month (sufficient for MVP)
- Workflow runs on every push and pull request
- Quality gates prevent merging broken code
- Build step ensures production build succeeds

### Learnings from Previous Story

**From Story 1.3 (Core App Routing & Layout Structure):**

**Components Available for Testing:**
- `components/layout/Header.tsx` - Client component with state (mobile menu toggle)
- `components/layout/Footer.tsx` - Server component with dynamic year
- `components/ui/button.tsx` - shadcn Button with variants
- `lib/utils.ts` - Utility function (cn helper for class name merging)

**Testing Opportunities:**
1. **Header Component**:
   - Mobile menu toggle state (useState)
   - Keyboard navigation (Escape key closes menu)
   - ARIA attributes (aria-label, aria-expanded)
   - Responsive display (hamburger on mobile, nav on desktop)

2. **Footer Component**:
   - Dynamic year calculation (`new Date().getFullYear()`)
   - Link rendering (Privacy, Terms)
   - Copyright text

3. **Button Component (shadcn/ui)**:
   - Variant prop (primary, secondary, ghost)
   - Click event handling
   - Keyboard accessibility
   - Class name merging

4. **Utility Function (cn helper)**:
   - Class name merging with clsx
   - Tailwind class conflict resolution with tailwind-merge
   - Conditional class handling

**Dependencies Already Installed:**
- lucide-react (icon library - may need mocking in tests)
- class-variance-authority (used by Button component)
- clsx, tailwind-merge (used by cn utility)

**Key Patterns Established:**
- TypeScript strict mode enabled (all tests must be type-safe)
- Client components use 'use client' directive (Header)
- Server components by default (Footer, pages)
- shadcn/ui components follow Radix UI accessibility patterns

**Build Already Successful:**
- TypeScript compilation passes
- ESLint validation passes
- Production build generates 7 routes
- No console errors in development

[Source: stories/1-3-core-app-routing-layout-structure.md#Dev-Agent-Record]

### Critical Implementation Notes

**CRITICAL: Jest Configuration for Next.js 16**

Next.js 16 requires specific Jest setup. Use the Next.js Jest preset to avoid configuration issues:

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
    '!**/*.test.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      statements: 70,
      functions: 70,
      branches: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

**CRITICAL: jest-dom Setup**

Create `jest.setup.js` to import jest-dom custom matchers:

```javascript
// jest.setup.js
import '@testing-library/jest-dom'
```

This enables matchers like `toBeInTheDocument()`, `toHaveClass()`, etc.

**CRITICAL: Testing Client Components with State**

When testing components with `'use client'` and useState (like Header):

```typescript
// Header.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from './Header'

test('mobile menu toggles on click', () => {
  render(<Header />)

  // Find hamburger button
  const menuButton = screen.getByRole('button', { name: /toggle navigation/i })

  // Menu should be closed initially
  expect(screen.queryByRole('navigation')).not.toBeVisible()

  // Click to open
  fireEvent.click(menuButton)
  expect(screen.getByRole('navigation')).toBeVisible()

  // Click to close
  fireEvent.click(menuButton)
  expect(screen.queryByRole('navigation')).not.toBeVisible()
})
```

**CRITICAL: CI Workflow Permissions**

GitHub Actions workflow must have correct permissions. If workflow fails with "Permission denied", add:

```yaml
permissions:
  contents: read
  pull-requests: write # If posting PR comments
```

**CRITICAL: Coverage Exclusions**

Always exclude from coverage:
- Test files (`*.test.ts`, `*.test.tsx`, `*.spec.ts`)
- Config files (`*.config.js`, `next.config.ts`, `tailwind.config.ts`)
- Type definitions (`*.d.ts`)
- Build output (`.next/`, `coverage/`, `dist/`)

### Testing Best Practices

**Unit Test Pattern (Pure Functions):**

Test utility functions in isolation:

```typescript
// lib/utils.test.ts
import { cn } from './utils'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('text-base', 'text-red-500')).toBe('text-red-500')
  })

  it('handles conditional classes', () => {
    const isActive = true
    expect(cn('btn', isActive && 'btn-active')).toContain('btn-active')
  })
})
```

**Component Test Pattern (React Components):**

Test components by user behavior, not implementation details:

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant class', () => {
    render(<Button variant="secondary">Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary') // Or whatever class is applied
  })
})
```

**Accessibility Testing Pattern:**

Test keyboard navigation and ARIA attributes:

```typescript
it('is keyboard accessible', () => {
  render(<Button>Press me</Button>)
  const button = screen.getByRole('button')

  // Tab to button
  button.focus()
  expect(button).toHaveFocus()

  // Press Enter
  fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
  // Assert expected behavior
})
```

### References

- [Source: docs/tech-spec-epic-1.md#Story-1.4]
- [Source: docs/epics.md#Story-1.4]
- [Source: docs/architecture.md#Testing-Strategy]
- [Source: stories/1-3-core-app-routing-layout-structure.md#Dev-Agent-Record]

### Prerequisites

**Required before starting:**
- ✅ Story 1.1 completed (Next.js project structure, TypeScript configured)
- ✅ Story 1.3 completed (Components available to test: Header, Footer, Button)
- ✅ ESLint already configured (Next.js default config)

**Dependencies for future stories:**
- Story 1.5 (Design System) will use testing patterns established here
- Epic 2 (Puzzle) will test SudokuGrid, NumberPad, Timer components
- Epic 3 (Auth) will test authentication flows
- Epic 4 (Leaderboard) will test real-time updates
- All future development depends on CI/CD pipeline working

### Success Criteria

This story is complete when:
- ✅ Jest and React Testing Library installed and configured
- ✅ `npm test` runs successfully with example tests passing
- ✅ `npm run test:coverage` generates coverage report ≥70%
- ✅ `.github/workflows/ci.yml` created and running on GitHub Actions
- ✅ CI pipeline passes on all PRs (lint, test, build)
- ✅ Example tests demonstrate patterns:
  - ✅ Utility function test (pure function testing)
  - ✅ Component test (React component testing with RTL)
- ✅ Coverage threshold enforced (CI fails if coverage <70%)
- ✅ All quality gates active (no broken code can be merged)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
