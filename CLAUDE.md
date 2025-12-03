# Project Rules for AI Agents

This file contains project-wide rules that ALL AI agents must follow when working on this codebase.

## Global Agent Rules

**🔒 MANDATORY FOR ALL AGENTS - NO EXCEPTIONS**

These rules are automatically enforced via Claude Code hooks and apply to ALL agents (SM, Dev, Architect, PM, etc.):

### Universal Constraints
1. **500 LOC Limit**: All deliverables (stories, code files, docs) MUST be under 500 lines
   - Stories exceeding 500 LOC MUST be split into multiple stories
   - Code files exceeding 500 LOC MUST be refactored into smaller modules

2. **No Over-Specification**: Trust the team - provide clear requirements without tutorial-style hand-holding
   - Focus on WHAT and WHY, not HOW (unless architecturally critical)
   - Avoid verbose examples and explanations
   - Keep documentation minimal and actionable

3. **No JSDoc**: Code should be self-descriptive with TypeScript types
   - Don't add docstrings or JSDoc comments
   - Only comment where logic isn't self-evident (security, anti-cheat, complex business rules)

4. **Testing Required**: ALL tests must pass 100% before marking work done
   - No exceptions - broken tests = blocked story
   - Follow existing test patterns in codebase

5. **Single Responsibility**: One file = one purpose
   - Keep files focused and cohesive
   - Prefer composition over large monolithic files

## Story Creation Rules

### Story Size Constraint (CRITICAL)
- **Maximum story length: 500 lines of code (LOC)**
- Stories exceeding 500 LOC MUST be split into multiple smaller stories
- This limit ensures:
  - Stories remain focused and testable
  - Faster review cycles
  - Reduced merge conflicts
  - Clear acceptance criteria
  - Manageable implementation scope

### Story Quality Standards
- Stories must be concise and focus ONLY on acceptance criteria
- Avoid unnecessary examples, verbose descriptions, or tutorial-style content
- Keep tasks/subtasks actionable and specific
- Documentation should be minimal and purpose-driven
- Trust the dev team - provide clear requirements without over-specifying implementation

## Code Quality Rules

### Single Responsibility Principle (SRP)
- Keep files under 500 LOC
- Prefer small, focused modules over large monolithic files
- Code should be self-documenting - avoid unnecessary comments

### Testing Standards
- ALL tests must pass 100% before marking stories as done
- Follow existing test patterns in the codebase
- Include unit and integration tests as appropriate

## Documentation Standards
- Avoid comment bloat - code should be self-explanatory
- Only add comments where logic isn't self-evident
- Don't add docstrings to code you didn't change
- Keep documentation concise and actionable
