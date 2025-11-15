-- إنشاء جدول تتبع وزن الحامل
CREATE TABLE IF NOT EXISTS public.pregnancy_weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_weight CHECK (weight_kg > 0 AND weight_kg < 500)
);

-- Enable RLS
ALTER TABLE public.pregnancy_weight_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own weight logs"
  ON public.pregnancy_weight_logs
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_pregnancy_weight_logs_user_date 
  ON public.pregnancy_weight_logs(user_id, log_date DESC);

-- Trigger for updated_at
CREATE TRIGGER update_pregnancy_weight_logs_updated_at
  BEFORE UPDATE ON public.pregnancy_weight_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();