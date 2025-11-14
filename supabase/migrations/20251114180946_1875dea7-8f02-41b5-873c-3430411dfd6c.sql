-- Performance Optimization: Add indexes for frequently queried columns

-- Indexes for cycles table (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_cycles_user_date 
ON public.cycles(user_id, start_date DESC);

-- Indexes for beauty_actions table
CREATE INDEX IF NOT EXISTS idx_beauty_actions_user_completed 
ON public.beauty_actions(user_id, completed, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_beauty_actions_user_phase 
ON public.beauty_actions(user_id, phase);

-- Indexes for cycle_days table
CREATE INDEX IF NOT EXISTS idx_cycle_days_user_date 
ON public.cycle_days(user_id, date DESC);

-- Indexes for fasting_entries table
CREATE INDEX IF NOT EXISTS idx_fasting_entries_user_date 
ON public.fasting_entries(user_id, date DESC);

-- Indexes for beauty_routines table
CREATE INDEX IF NOT EXISTS idx_beauty_routines_user_reminder 
ON public.beauty_routines(user_id, reminder_enabled, reminder_time)
WHERE reminder_enabled = true;

-- Indexes for daughters table (for mother persona)
CREATE INDEX IF NOT EXISTS idx_daughters_mother 
ON public.daughters(mother_id);

-- Indexes for daughter_cycles table
CREATE INDEX IF NOT EXISTS idx_daughter_cycles_daughter_date 
ON public.daughter_cycles(daughter_id, start_date DESC);

-- Indexes for share_links (partner feature)
CREATE INDEX IF NOT EXISTS idx_share_links_owner_status 
ON public.share_links(owner_id, status)
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_share_links_connected_status 
ON public.share_links(connected_user_id, status)
WHERE status = 'active';

-- Add index for articles filtering
CREATE INDEX IF NOT EXISTS idx_articles_lang_category 
ON public.articles(lang, category, created_at DESC);

-- Composite index for beauty_action_history
CREATE INDEX IF NOT EXISTS idx_beauty_action_history_lookup 
ON public.beauty_action_history(original_action_id, next_due_date);

COMMENT ON INDEX idx_cycles_user_date IS 'Optimize cycle lookups by user and date';
COMMENT ON INDEX idx_beauty_actions_user_completed IS 'Optimize beauty actions queries';
COMMENT ON INDEX idx_cycle_days_user_date IS 'Optimize cycle days lookups';
COMMENT ON INDEX idx_fasting_entries_user_date IS 'Optimize fasting entries queries';