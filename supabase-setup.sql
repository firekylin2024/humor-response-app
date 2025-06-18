-- 创建幽默回应历史记录表
CREATE TABLE IF NOT EXISTS public.humor_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    input TEXT NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
    responses JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_humor_responses_user_id ON public.humor_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_humor_responses_created_at ON public.humor_responses(created_at);

-- 启用行级安全策略
ALTER TABLE public.humor_responses ENABLE ROW LEVEL SECURITY;

-- 创建安全策略：用户只能访问自己的记录
CREATE POLICY "Users can view own humor responses" ON public.humor_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own humor responses" ON public.humor_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own humor responses" ON public.humor_responses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own humor responses" ON public.humor_responses
    FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER update_humor_responses_updated_at
    BEFORE UPDATE ON public.humor_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 