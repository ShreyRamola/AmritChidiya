-- ============================================================================
-- AmritChidiya - Supabase Database Schema Migration
-- Execute this SQL snippet in your Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DOUBLE PRECISION NOT NULL DEFAULT extract(epoch from now())
);

-- 2. Create Chats Table
CREATE TABLE IF NOT EXISTS public.chats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    language TEXT NOT NULL,
    messages_json TEXT NOT NULL,
    schemes_json TEXT NOT NULL,
    updated_at DOUBLE PRECISION NOT NULL DEFAULT extract(epoch from now())
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at DESC);

-- 4. Enable Row Level Security (RLS) & Public Policies (for API access)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert on users" ON public.users;
CREATE POLICY "Allow public select on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on chats" ON public.chats;
DROP POLICY IF EXISTS "Allow public insert on chats" ON public.chats;
DROP POLICY IF EXISTS "Allow public update on chats" ON public.chats;
DROP POLICY IF EXISTS "Allow public delete on chats" ON public.chats;
CREATE POLICY "Allow public select on chats" ON public.chats FOR SELECT USING (true);
CREATE POLICY "Allow public insert on chats" ON public.chats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on chats" ON public.chats FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on chats" ON public.chats FOR DELETE USING (true);
