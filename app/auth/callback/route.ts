import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // TODO: Epic 3 - Handle OAuth callback
  // This is a foundation for future OAuth implementation
  // Will use Supabase client to exchange code for session

  // For now, redirect to home page
  return NextResponse.redirect(new URL('/', request.url))
}
