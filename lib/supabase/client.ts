import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie
            .split('; ')
            .filter(Boolean)
            .map(cookie => {
              const [name, value] = cookie.split('=')
              return { name, value }
            })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${value}`
            
            if (options?.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`
            }
            if (options?.expires) {
              cookieString += `; Expires=${options.expires.toUTCString()}`
            }
            if (options?.path) {
              cookieString += `; Path=${options.path}`
            }
            if (options?.domain) {
              cookieString += `; Domain=${options.domain}`
            }
            if (options?.secure) {
              cookieString += '; Secure'
            }
            if (options?.httpOnly) {
              cookieString += '; HttpOnly'
            }
            if (options?.sameSite) {
              cookieString += `; SameSite=${options.sameSite}`
            }
            
            document.cookie = cookieString
          })
        },
      },
    }
  )
} 