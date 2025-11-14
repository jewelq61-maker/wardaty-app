-- Create table for daughter cycles
CREATE TABLE IF NOT EXISTS public.daughter_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daughter_id UUID NOT NULL REFERENCES public.daughters(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  length INTEGER,
  duration INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for daughter fasting entries
CREATE TABLE IF NOT EXISTS public.daughter_fasting_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daughter_id UUID NOT NULL REFERENCES public.daughters(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daughter_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daughter_fasting_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daughter_cycles
CREATE POLICY "Mothers can manage daughter cycles"
ON public.daughter_cycles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.daughters
    WHERE daughters.id = daughter_cycles.daughter_id
    AND daughters.mother_id = auth.uid()
  )
);

-- Create RLS policies for daughter_fasting_entries
CREATE POLICY "Mothers can manage daughter fasting entries"
ON public.daughter_fasting_entries
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.daughters
    WHERE daughters.id = daughter_fasting_entries.daughter_id
    AND daughters.mother_id = auth.uid()
  )
);

-- Add trigger for daughter_cycles updated_at
CREATE TRIGGER update_daughter_cycles_updated_at
BEFORE UPDATE ON public.daughter_cycles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_daughter_cycles_daughter_id ON public.daughter_cycles(daughter_id);
CREATE INDEX idx_daughter_cycles_start_date ON public.daughter_cycles(start_date DESC);
CREATE INDEX idx_daughter_fasting_entries_daughter_id ON public.daughter_fasting_entries(daughter_id);
CREATE INDEX idx_daughter_fasting_entries_date ON public.daughter_fasting_entries(date);