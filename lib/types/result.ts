/**
 * Result Type for Error Handling
 *
 * Discriminated union type for type-safe error handling in Server Actions.
 * Replaces throwing exceptions across client/server boundary.
 *
 * @see docs/architecture.md (Error Handling Patterns section)
 */

/**
 * Success result
 */
export interface Success<T> {
  success: true;
  data: T;
}

/**
 * Error result
 */
export interface Failure<E = Error> {
  success: false;
  error: E;
}

/**
 * Result discriminated union
 *
 * Use this type for all Server Action return values to provide type-safe error handling.
 *
 * @template T - Success data type
 * @template E - Error type (defaults to Error)
 *
 * @example
 * ```typescript
 * // Server Action
 * export async function completePuzzle(
 *   puzzleId: string,
 *   solution: number[][]
 * ): Promise<Result<{ correct: boolean; rank?: number }, string>> {
 *   try {
 *     // Validation
 *     if (!isValidSolution(solution)) {
 *       return { success: false, error: 'Invalid solution format' }
 *     }
 *
 *     // Business logic
 *     const correct = checkSolution(puzzleId, solution)
 *     if (!correct) {
 *       return { success: false, error: 'Incorrect solution. Keep trying!' }
 *     }
 *
 *     const rank = await saveCompletion(puzzleId, solution)
 *     return { success: true, data: { correct: true, rank } }
 *   } catch (error) {
 *     logger.error('Failed to complete puzzle', error as Error, { puzzleId })
 *     return { success: false, error: 'Something went wrong. Please try again.' }
 *   }
 * }
 *
 * // Client Component
 * const result = await completePuzzle(puzzleId, solution)
 * if (result.success) {
 *   console.log('Rank:', result.data.rank) // Type-safe access
 * } else {
 *   toast.error(result.error) // User-friendly error message
 * }
 * ```
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Type guard to check if Result is success
 *
 * @param result - Result to check
 * @returns true if success, false if failure
 *
 * @example
 * ```typescript
 * const result = await fetchData()
 * if (isSuccess(result)) {
 *   console.log(result.data) // TypeScript knows this is Success<T>
 * } else {
 *   console.error(result.error) // TypeScript knows this is Failure<E>
 * }
 * ```
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

/**
 * Type guard to check if Result is failure
 *
 * @param result - Result to check
 * @returns true if failure, false if success
 *
 * @example
 * ```typescript
 * const result = await fetchData()
 * if (isFailure(result)) {
 *   handleError(result.error)
 *   return
 * }
 * // Continue with result.data
 * ```
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}

/**
 * Unwrap Result value or throw error
 *
 * Use when you're certain the Result is a success or want to propagate the error.
 *
 * @param result - Result to unwrap
 * @returns Success data
 * @throws Error if result is failure
 *
 * @example
 * ```typescript
 * try {
 *   const data = unwrap(await fetchData())
 *   console.log(data) // Guaranteed to be success data
 * } catch (error) {
 *   console.error('Failed to fetch:', error)
 * }
 * ```
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Unwrap Result value or return default
 *
 * Safe alternative to unwrap() that never throws.
 *
 * @param result - Result to unwrap
 * @param defaultValue - Default value if result is failure
 * @returns Success data or default value
 *
 * @example
 * ```typescript
 * const data = unwrapOr(await fetchData(), [])
 * // data is guaranteed to be T (never throws)
 * ```
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}
