-- Add partner privacy settings to share_links
ALTER TABLE public.share_links 
ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT '{
  "show_period_days": true,
  "show_fertility_window": true,
  "show_general_mood": false,
  "show_pregnancy": true,
  "show_nothing": false
}'::jsonb;

-- Add comment
COMMENT ON COLUMN public.share_links.privacy_settings IS 'Privacy settings for what partner can see';