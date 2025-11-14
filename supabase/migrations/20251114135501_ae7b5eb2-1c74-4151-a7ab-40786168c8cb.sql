-- Create table for Apple Health sync settings
CREATE TABLE IF NOT EXISTS public.apple_health_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sync_steps BOOLEAN DEFAULT true,
  sync_sleep BOOLEAN DEFAULT true,
  sync_heart_rate BOOLEAN DEFAULT true,
  sync_weight BOOLEAN DEFAULT false,
  auto_sync_enabled BOOLEAN DEFAULT false,
  auto_sync_time TIME DEFAULT '08:00:00',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.apple_health_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own health settings"
  ON public.apple_health_settings
  FOR ALL
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_apple_health_settings_updated_at
  BEFORE UPDATE ON public.apple_health_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();