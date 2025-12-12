# Sudoku Race - E2E Test Suite

Production-ready Playwright test framework for sudoku-race application.

---

## Setup

### Prerequisites

- Node.js 20+ (check `.nvmrc`)
- npm or yarn
- Supabase CLI (for local development)

### Installation

```bash
# Install Playwright and dependencies
npm install -D @playwright/test @faker-js/faker dotenv

# Install Playwright browsers
npx playwright install chromium

# Copy environment template
cp .env.test.example .env.test

# Fill in your environment variables in .env.test
```

### Environment Configuration

Create `.env.test` from `.env.test.example` and configure:

```bash
BASE_URL=http://localhost:3000
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password-123
```

---

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e tests/e2e/sudoku-completion.spec.ts

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run tests in UI mode (interactive debugging)
npm run test:e2e -- --ui

# Debug specific test
npm run test:e2e -- tests/e2e/example.spec.ts --debug

# Run tests with coverage
npm run test:e2e -- --coverage
```

---

## Architecture Overview

### Directory Structure

```
tests/
├── e2e/                          # Test files
│   ├── sudoku-completion.spec.ts # Sudoku completion flows
│   └── example.spec.ts           # Example patterns
├── support/                      # Framework infrastructure
│   ├── fixtures/                 # Test fixtures
│   │   ├── index.ts              # Fixture exports
│   │   └── factories/            # Data factories
│   │       └── puzzle.factory.ts # Puzzle test data
│   └── helpers/                  # Utility functions
│       └── auth.helper.ts        # Authentication utilities
└── README.md                     # This file
```

### Fixture Pattern

**Fixtures** provide auto-setup and auto-cleanup for tests:

```typescript
import { test, expect } from '../support/fixtures';

test('my test', async ({ page, authenticatedUser }) => {
  // authenticatedUser is ready to use
  // Cleanup happens automatically after test
});
```

Pattern: Pure function → fixture → mergeTests composition

See: `.bmad/bmm/testarch/knowledge/fixture-architecture.md`

### Data Factories

**Factories** generate random test data using `@faker-js/faker`:

```typescript
import { createPuzzle, createSolvedGrid } from '../support/fixtures/factories/puzzle.factory';

const puzzle = createPuzzle({ difficulty: 'easy' });
const solvedGrid = createSolvedGrid();
```

Benefits:
- No hardcoded test data
- Avoids collisions
- Supports overrides for specific scenarios

See: `.bmad/bmm/testarch/knowledge/data-factories.md`

### Network-First Testing

**Critical pattern**: Intercept routes BEFORE navigation to prevent race conditions.

```typescript
// ✅ CORRECT: Intercept BEFORE navigation
await page.route('**/api/puzzle/**', (route) =>
  route.fulfill({ status: 200, body: JSON.stringify(mockPuzzle) })
);
await page.goto('/puzzle');

// ❌ WRONG: Navigate then intercept (race condition!)
await page.goto('/puzzle');
await page.route('**/api/puzzle/**', handler); // Too late!
```

See: `.bmad/bmm/testarch/knowledge/network-first.md`

---

## Best Practices

### Given-When-Then Structure

Structure tests with clear setup, action, and assertion phases:

```typescript
test('should complete puzzle', async ({ page }) => {
  // GIVEN: User starts a puzzle
  await page.goto('/puzzle');

  // WHEN: User completes the puzzle
  await fillPuzzleGrid(page, solvedGrid);
  await page.click('[data-testid="submit-button"]');

  // THEN: Completion modal appears
  await expect(page.locator('[data-testid="completion-modal"]')).toBeVisible();
});
```

### Selector Strategy

**Priority hierarchy**:
1. `data-testid` attributes (most stable)
2. ARIA roles and labels
3. Text content (use `has-text`)
4. CSS selectors (last resort)

```typescript
// ✅ Preferred: data-testid
await page.click('[data-testid="submit-button"]');

// ✅ Good: ARIA role
await page.click('button[role="button"]:has-text("Submit")');

// ❌ Avoid: brittle CSS selectors
await page.click('.btn.btn-primary.submit-btn');
```

See: `.bmad/bmm/testarch/knowledge/selector-resilience.md`

### Test Isolation

Each test must be **fully isolated**:
- No shared state between tests
- Create fresh data for each test
- Cleanup happens automatically via fixtures

```typescript
test('test 1', async ({ page }) => {
  const user = await createTestUser(); // Fresh user
  // Test uses user
  // Cleanup happens automatically
});

test('test 2', async ({ page }) => {
  const user = await createTestUser(); // Different fresh user
  // Tests are independent
});
```

### One Assertion Per Test

Keep tests **atomic** - one logical assertion per test:

```typescript
// ✅ CORRECT: Atomic test
test('should display user name', async ({ page }) => {
  await expect(page.locator('[data-testid="user-name"]')).toHaveText('John');
});

// ❌ WRONG: Multiple assertions (not atomic)
test('should display user info', async ({ page }) => {
  await expect(page.locator('[data-testid="user-name"]')).toHaveText('John');
  await expect(page.locator('[data-testid="user-email"]')).toHaveText('john@example.com');
});
```

See: `.bmad/bmm/testarch/knowledge/test-quality.md`

---

## CI Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000
          CI: true
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: test-results/
```

### Configuration for CI

Playwright config automatically adjusts for CI:
- Retries: 2 (for flake tolerance)
- Workers: 1 (shared Supabase instance)
- Artifacts: failure-only (reduces storage)

---

## Debugging

### UI Mode

Interactive test debugging with time travel:

```bash
npm run test:e2e -- --ui
```

Features:
- Watch tests execute
- Time travel through test steps
- Inspect DOM, network, console
- Edit and re-run tests

### Debug Mode

Step through tests with debugger:

```bash
npm run test:e2e -- tests/e2e/example.spec.ts --debug
```

### Traces

View full trace with screenshots, network, and console:

```bash
# Run tests (traces captured on failure)
npm run test:e2e

# Open trace viewer
npx playwright show-trace test-results/.../trace.zip
```

### Headed Mode

Watch tests execute in browser:

```bash
npm run test:e2e -- --headed --slowMo=1000
```

---

## Troubleshooting

### Common Issues

**Tests timeout:**
- Check Supabase is running: `supabase status`
- Increase timeout in `playwright.config.ts`
- Use `--debug` mode to identify bottleneck

**Authentication fails:**
- Verify `.env.test` credentials
- Check Supabase service role key
- Confirm test user exists in database

**Flaky tests:**
- Add explicit waits for network requests
- Use `page.waitForLoadState('networkidle')`
- Apply network-first pattern (intercept before navigate)

**Browser not installed:**
```bash
npx playwright install chromium
```

---

## Knowledge Base References

This test framework follows patterns from BMad TEA knowledge base:

- **fixture-architecture.md** - Fixture patterns with auto-cleanup
- **data-factories.md** - Faker-based factories with overrides
- **network-first.md** - Route interception before navigation
- **test-quality.md** - Test design principles (Given-When-Then, atomicity)
- **selector-resilience.md** - Selector hierarchy and stability
- **timing-debugging.md** - Race condition prevention

Full knowledge base: `.bmad/bmm/testarch/knowledge/`

---

## Next Steps

1. ✅ Framework scaffolded
2. ⏭️ Run ATDD workflow to generate failing E2E tests for sudoku completion
3. ⏭️ Implement features to make tests pass (RED → GREEN)
4. ⏭️ Refactor with confidence (tests provide safety net)

---

## Contact

**Questions or Issues?**
- Review knowledge base: `.bmad/bmm/testarch/knowledge/`
- Check TEA index: `.bmad/bmm/testarch/tea-index.csv`
- Ask in team standup or Slack

---

**Generated by BMad TEA Agent** - 2025-12-12
