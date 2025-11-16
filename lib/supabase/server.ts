import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for Server Components and Server Actions.
 *
 * CRITICAL: Use this function for all server-side database operations.
 * - Handles server-side cookies properly for authentication
 * - Required for Server Actions (marked with 'use server')
 * - Required for Server Components
 *
 * @returns Supabase client configured for server-side rendering
 *
 * @example
 * ```typescript
 * // In a Server Action
 * 'use server'
 *
 * import { createServerClient } from '@/lib/supabase/server'
 *
 * export async function getPuzzleToday() {
 *   const supabase = await createServerClient()
 *   const { data, error } = await supabase
 *     .from('puzzles')
 *     .select('*')
 *     .single()
 *
 *   return data
 * }
 * ```
 *
 * @see {@link https://supabase.com/docs/guides/auth/server-side/nextjs} Supabase SSR Guide
 * @see architecture.md - Server Action Pattern section
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        }
      }
    }
  )
}
