-- Fix share code security issues
ALTER TABLE public.share_links ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
ALTER TABLE public.share_links ADD CONSTRAINT unique_share_code UNIQUE (code);

-- Create security definer function for partner access
CREATE OR REPLACE FUNCTION public.is_authorized_partner(_user_id uuid, _owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.share_links
    WHERE (owner_id = _owner_id AND connected_user_id = _user_id)
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Update RLS policies for profiles table to allow partner access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile or partner profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR public.is_authorized_partner(auth.uid(), id)
);

-- Update RLS policies for cycles table to allow partner access
DROP POLICY IF EXISTS "Users can manage own cycles" ON public.cycles;

CREATE POLICY "Users can view own or partner cycles"
ON public.cycles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.is_authorized_partner(auth.uid(), user_id)
);

CREATE POLICY "Users can manage own cycles"
ON public.cycles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycles"
ON public.cycles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycles"
ON public.cycles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Update RLS policies for cycle_days table to allow partner access
DROP POLICY IF EXISTS "Users can manage own cycle days" ON public.cycle_days;

CREATE POLICY "Users can view own or partner cycle days"
ON public.cycle_days
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.is_authorized_partner(auth.uid(), user_id)
);

CREATE POLICY "Users can manage own cycle days"
ON public.cycle_days
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle days"
ON public.cycle_days
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycle days"
ON public.cycle_days
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);