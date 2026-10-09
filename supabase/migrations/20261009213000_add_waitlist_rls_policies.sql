-- Add RLS policies and role grants to public.waitlist to support upsert operations

-- 1. Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 2. Grant permissions required for upsert (INSERT, UPDATE, and SELECT)
GRANT SELECT, INSERT, UPDATE ON TABLE public.waitlist TO anon, authenticated;

-- 3. Policy for INSERT (new waitlist submissions)
DROP POLICY IF EXISTS "Allow public insert into waitlist" ON public.waitlist;
CREATE POLICY "Allow public insert into waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. Policy for UPDATE (updates existing row when email matches on conflict)
DROP POLICY IF EXISTS "Allow public update of own waitlist submission" ON public.waitlist;
DROP POLICY IF EXISTS "Allow public update of waitlist" ON public.waitlist;
CREATE POLICY "Allow public update of waitlist"
  ON public.waitlist
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Policy for SELECT (required by PostgreSQL to evaluate conflict target during upsert)
DROP POLICY IF EXISTS "Allow public select on waitlist" ON public.waitlist;
CREATE POLICY "Allow public select on waitlist"
  ON public.waitlist
  FOR SELECT
  TO anon, authenticated
  USING (true);
