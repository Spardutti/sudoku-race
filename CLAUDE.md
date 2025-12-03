# Claude Development Guidelines

## Project Standards

### File Length Limits

- **Documentation files**: Maximum 500 lines of code
- **Code files**: Maximum 200 lines of code
- If a file exceeds limits, split it into smaller, focused modules

### Code Quality

- **Always run ESLint** before committing changes
- **Always run build** to check for TypeScript/compilation errors
- Fix all errors before marking work complete

### Documentation Style

- **NO JSDocs** - code should be self-documenting
- **NO extensive comments** - write clear code instead
- Comments only when logic is non-obvious or complex

### Code Principles

- **Single Responsibility Principle**: Each function/component does ONE thing
- Keep functions small and focused
- Extract complex logic into separate, named functions

### Library Research

- **Use Context7** for researching library documentation and APIs
- Always check latest library versions and best practices
- Verify examples against official documentation

## Workflow

1. Read and understand requirements
2. Check existing code patterns
3. Research libraries with Context7 if needed
4. Write focused, single-purpose code
5. Run ESLint: `npm run lint`
6. Run build: `npm run build`
7. Fix any errors before completing

## Quick Reference

```bash
# Lint check
npm run lint

# Build check
npm run build

# Both checks
npm run lint && npm run build
```

Remember: **Clean, focused, error-free code over extensive documentation.**
