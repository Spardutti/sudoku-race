import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create Supabase client for Server Components (read-only)
 * Use this in Server Components (page.tsx, layout.tsx) for data fetching
 * Sessions are read-only - mutations will be ignored
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // Empty implementation for Server Components (read-only)
          // Cookie mutations should only happen in Server Actions
        }
      }
    }
  )
}

/**
 * Create Supabase client for Server Actions (read-write)
 * Use this in Server Actions where cookie mutations are allowed
 */
export async function createServerActionClient() {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        }
      }
    }
  )
}
