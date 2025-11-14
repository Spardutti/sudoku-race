const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Only collect coverage for pure functions and business logic
  collectCoverageFrom: [
    'lib/**/*.{js,ts}',
    '!lib/**/*.d.ts',
    '!lib/**/*.test.{js,ts}',
    '!lib/types/**', // Exclude TypeScript type definitions
    '!lib/supabase.ts', // Exclude config/client setup (not business logic)
    '!**/node_modules/**',
  ],
  // Enforce 70% coverage threshold ONLY on lib/** (pure functions/business logic)
  // UI components, layouts, and pages are better tested through E2E tests
  coverageThreshold: {
    'lib/**/*.{js,ts}': {
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
