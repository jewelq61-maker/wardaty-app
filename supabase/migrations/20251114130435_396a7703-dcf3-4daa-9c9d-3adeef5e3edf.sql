-- Add pregnancy tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_pregnant boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pregnancy_lmp date,
ADD COLUMN IF NOT EXISTS pregnancy_edd date,
ADD COLUMN IF NOT EXISTS pregnancy_calculation_method text CHECK (pregnancy_calculation_method IN ('lmp', 'edd'));

-- Create pregnancy appointments table
CREATE TABLE IF NOT EXISTS public.pregnancy_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time text,
  appointment_type text NOT NULL CHECK (appointment_type IN ('doctor_visit', 'ultrasound', 'vaccine', 'lab_test', 'other')),
  title text NOT NULL,
  notes text,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create pregnancy medicines table
CREATE TABLE IF NOT EXISTS public.pregnancy_medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  dosage text,
  frequency text,
  start_date date NOT NULL,
  end_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create pregnancy notes table
CREATE TABLE IF NOT EXISTS public.pregnancy_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_date date NOT NULL,
  note_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add pregnancy fields to daughters table
ALTER TABLE public.daughters
ADD COLUMN IF NOT EXISTS is_pregnant boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pregnancy_lmp date,
ADD COLUMN IF NOT EXISTS pregnancy_edd date;

-- Enable RLS
ALTER TABLE public.pregnancy_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pregnancy_appointments
CREATE POLICY "Users can manage own pregnancy appointments"
  ON public.pregnancy_appointments
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for pregnancy_medicines
CREATE POLICY "Users can manage own pregnancy medicines"
  ON public.pregnancy_medicines
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for pregnancy_notes
CREATE POLICY "Users can manage own pregnancy notes"
  ON public.pregnancy_notes
  FOR ALL
  USING (auth.uid() = user_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_pregnancy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_pregnancy_appointments_updated_at
  BEFORE UPDATE ON public.pregnancy_appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pregnancy_updated_at();

CREATE TRIGGER update_pregnancy_medicines_updated_at
  BEFORE UPDATE ON public.pregnancy_medicines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pregnancy_updated_at();