import { createServerClient } from '@supabase/ssr'
import { type NextRequest, type NextResponse } from 'next/server'

export function createClient(request?: NextRequest, response?: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (request) {
            return request.cookies.getAll()
          }
          return []
        },
        setAll(cookiesToSet) {
          if (response) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          }
        },
      },
    }
  )
} 