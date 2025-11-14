-- Create table for app settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Notification settings
  notifications_enabled BOOLEAN DEFAULT true,
  period_reminders BOOLEAN DEFAULT true,
  beauty_reminders BOOLEAN DEFAULT true,
  fasting_reminders BOOLEAN DEFAULT true,
  routine_reminders BOOLEAN DEFAULT true,
  
  -- Privacy settings
  data_sharing BOOLEAN DEFAULT false,
  analytics_enabled BOOLEAN DEFAULT true,
  
  -- Display settings
  compact_view BOOLEAN DEFAULT false,
  show_lunar_calendar BOOLEAN DEFAULT true,
  show_hijri_dates BOOLEAN DEFAULT true,
  
  -- Auto backup
  auto_backup_enabled BOOLEAN DEFAULT false,
  backup_frequency TEXT DEFAULT 'weekly',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own settings"
  ON public.app_settings
  FOR ALL
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();