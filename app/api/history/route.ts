import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { HumorResponseInsert } from '@/lib/supabase/database.types'

// GET - 获取用户的历史记录
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(request)
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取历史记录
    const { data: history, error } = await supabase
      .from('humor_responses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('获取历史记录失败:', error)
      return NextResponse.json({ error: '获取历史记录失败' }, { status: 500 })
    }

    return NextResponse.json({ history })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// POST - 保存新的历史记录
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(request)
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { input, intensity, responses } = body

    if (!input || !intensity || !responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    // 保存历史记录
    const newRecord: HumorResponseInsert = {
      user_id: user.id,
      input,
      intensity,
      responses,
    }

    const { data, error } = await supabase
      .from('humor_responses')
      .insert(newRecord)
      .select()
      .single()

    if (error) {
      console.error('保存历史记录失败:', error)
      return NextResponse.json({ error: '保存失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// DELETE - 删除历史记录
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(request)
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少记录ID' }, { status: 400 })
    }

    // 删除历史记录（只能删除自己的）
    const { error } = await supabase
      .from('humor_responses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('删除历史记录失败:', error)
      return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 