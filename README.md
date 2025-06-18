# 幽默回应生成器

这是一个使用 AI 生成幽默回应的应用程序。

## 更新记录

这里将记录项目的更新历史和重要改动。 

## Supabase 认证功能

已添加基于 Supabase 的 Google 和 GitHub OAuth 登录功能。

### 需要替换的虚拟配置

在 `.env.local` 文件中，您需要替换以下虚拟值：

1. `NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co`
   - 替换为您的实际 Supabase 项目 URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - 替换为您的实际 Supabase Anon Key

### Supabase 配置要求

在 Supabase 仪表板中：
1. 启用 Google OAuth 提供商
2. 启用 GitHub OAuth 提供商  
3. 配置回调 URL：
   - `http://localhost:3000/auth/callback` (开发环境)
   - `https://your-domain.com/auth/callback` (生产环境)

### 更新记录

20250604，添加追踪代码plausible和clarity
20250104，添加Supabase认证功能（Google和GitHub登录）