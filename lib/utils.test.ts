import { cn } from './utils'

/**
 * Unit Test Pattern for Pure Functions
 *
 * This test demonstrates how to test utility functions (pure functions):
 * - Focus on input → output relationships
 * - Test edge cases and common use cases
 * - No mocking needed for pure functions
 * - Fast, deterministic, and isolated
 */
describe('cn utility', () => {
  /**
   * Test Case 1: Basic Class Name Merging
   * The cn() function should merge multiple class names into a single string
   */
  it('merges class names correctly', () => {
    expect(cn('text-base', 'font-bold')).toBe('text-base font-bold')
    expect(cn('px-4', 'py-2', 'rounded')).toBe('px-4 py-2 rounded')
  })

  /**
   * Test Case 2: Conditional Classes
   * The cn() function should handle conditional classes using boolean logic
   * This is a common pattern when styling components based on state/props
   */
  it('handles conditional classes', () => {
    const isActive = true
    const isDisabled = false

    // Should include class when condition is true
    expect(cn('btn', isActive && 'btn-active')).toBe('btn btn-active')

    // Should exclude class when condition is false
    expect(cn('btn', isDisabled && 'btn-disabled')).toBe('btn')

    // Should handle multiple conditionals
    expect(cn(
      'btn',
      isActive && 'btn-active',
      isDisabled && 'btn-disabled'
    )).toBe('btn btn-active')
  })

  /**
   * Test Case 3: Tailwind Class Conflict Resolution
   * The cn() function uses tailwind-merge to resolve conflicting Tailwind classes
   * This is critical for component variants where later classes should override earlier ones
   *
   * Example: A component with default text-base that receives text-red-500 as a prop
   * should render with text-red-500, not both classes
   */
  it('removes conflicting Tailwind classes', () => {
    // Color conflicts: text-red-500 should override text-blue-500
    expect(cn('text-blue-500', 'text-red-500')).toBe('text-red-500')

    // Size conflicts: text-lg should override text-base
    expect(cn('text-base', 'text-lg')).toBe('text-lg')

    // Padding conflicts: px-4 should override px-2
    expect(cn('px-2 py-2', 'px-4')).toBe('py-2 px-4')

    // Multiple conflict types
    expect(cn('text-base text-blue-500', 'text-lg text-red-500')).toBe('text-lg text-red-500')
  })

  /**
   * Test Case 4: Empty and Undefined Inputs
   * The cn() function should handle edge cases gracefully
   */
  it('handles empty and undefined inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn(undefined)).toBe('')
    expect(cn(null)).toBe('')
    expect(cn('btn', undefined, 'active')).toBe('btn active')
  })

  /**
   * Test Case 5: Array Inputs
   * The cn() function should handle arrays of class names (clsx feature)
   */
  it('handles array inputs', () => {
    expect(cn(['btn', 'btn-primary'])).toBe('btn btn-primary')
    expect(cn('base', ['variant', 'size'])).toBe('base variant size')
  })

  /**
   * Test Case 6: Object Inputs
   * The cn() function should handle objects with conditional classes (clsx feature)
   * This is useful for dynamic class application based on props
   */
  it('handles object inputs', () => {
    expect(cn({
      'btn': true,
      'btn-primary': true,
      'btn-disabled': false
    })).toBe('btn btn-primary')

    expect(cn('base', {
      'active': true,
      'disabled': false
    })).toBe('base active')
  })
})
