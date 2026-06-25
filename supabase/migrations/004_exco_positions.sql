-- Add position column to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position TEXT;

-- Add position column to public.legacy_members
ALTER TABLE public.legacy_members ADD COLUMN IF NOT EXISTS position TEXT;

-- Add event_date column to public.announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS event_date DATE;
