-- Add daughters tracking table for mother persona
CREATE TABLE IF NOT EXISTS public.daughters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  birth_date date,
  cycle_start_age integer,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daughters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daughters
CREATE POLICY "Mothers can manage own daughters"
ON public.daughters
FOR ALL
USING (auth.uid() = mother_id);

-- Add pregnancy and postpartum tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pregnancy_due_date date,
ADD COLUMN IF NOT EXISTS pregnancy_weeks integer,
ADD COLUMN IF NOT EXISTS postpartum_start_date date,
ADD COLUMN IF NOT EXISTS breastfeeding boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS breastfeeding_start_date date;

-- Add trigger for daughters updated_at
CREATE TRIGGER update_daughters_updated_at
BEFORE UPDATE ON public.daughters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();