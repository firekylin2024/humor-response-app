import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  const response = NextResponse.next()
  const supabase = createClient(request, response)

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // 原域名
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // 本地开发环境
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // 生产环境，使用原域名
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // 备用方案
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // 认证失败，重定向到错误页面
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 