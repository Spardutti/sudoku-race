# Project Rules for AI Agents

This file contains project-wide rules that ALL AI agents must follow when working on this codebase.

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
