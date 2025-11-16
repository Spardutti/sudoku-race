import { createBrowserClient as createClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for Client Components.
 *
 * Use this function for browser-side database operations in:
 * - Client Components (marked with 'use client')
 * - Client-side event handlers
 * - Browser-only code
 *
 * DO NOT use this for:
 * - Server Actions (use createServerClient from @/lib/supabase/server)
 * - Server Components (use createServerClient from @/lib/supabase/server)
 *
 * @returns Supabase client configured for browser environment
 *
 * @example
 * ```typescript
 * // In a Client Component
 * 'use client'
 *
 * import { createBrowserClient } from '@/lib/supabase/client'
 *
 * export function PuzzleGrid() {
 *   const supabase = createBrowserClient()
 *
 *   const handleSubmit = async () => {
 *     const { data } = await supabase
 *       .from('puzzles')
 *       .select('puzzle_data')
 *       .single()
 *   }
 *
 *   return <div>...</div>
 * }
 * ```
 *
 * @see {@link https://supabase.com/docs/guides/auth/server-side/nextjs} Supabase SSR Guide
 * @see architecture.md - Server Action Pattern section
 */
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
