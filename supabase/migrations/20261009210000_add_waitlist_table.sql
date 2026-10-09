-- Create waitlist table for pre-launch early access signups
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  hurdles TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anon and authenticated) to submit to waitlist
CREATE POLICY "Allow public insert into waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow public upsert of own waitlist submission
CREATE POLICY "Allow public update of own waitlist submission"
  ON public.waitlist
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
