import { createServerClient as createClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
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

/**
 * Create Supabase admin client with service role (bypasses RLS)
 * ONLY use for dev tools or trusted admin operations
 * DEV MODE ONLY
 */
export function createServiceRoleClient() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Service role client not available in production')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not found')
  }

  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
