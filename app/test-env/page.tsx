export default function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">环境变量测试</h1>
      <div className="space-y-2">
        <p>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
          {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置'}
        </p>
        <p>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置'}
        </p>
        <p>
          <strong>URL值:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '未找到'}
        </p>
        <p>
          <strong>Key前10位:</strong>{' '}
          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) || '未找到'}
        </p>
      </div>
    </div>
  )
} 