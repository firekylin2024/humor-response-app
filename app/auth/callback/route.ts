import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  // 创建重定向响应
  const redirectUrl = `${origin}${next}`
  const response = NextResponse.redirect(redirectUrl)
  const supabase = createClient(request, response)

  if (code) {
    console.log('处理OAuth回调，code:', code.substring(0, 10) + '...')
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      console.log('会话交换成功，用户:', data.session.user.email)
      
      // 会话交换成功，返回已经配置好 cookies 的响应
      return response
    } else {
      console.error('会话交换失败:', error)
    }
  }

  // 认证失败，重定向到错误页面
  console.log('认证失败，重定向到错误页面')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 