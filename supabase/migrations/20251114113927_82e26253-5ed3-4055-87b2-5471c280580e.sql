-- Add fields to beauty_actions for enhanced beauty planner
ALTER TABLE beauty_actions
ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'custom' CHECK (action_type IN ('system', 'custom')),
ADD COLUMN IF NOT EXISTS beauty_category TEXT,
ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 0 AND score <= 100),
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS warnings TEXT[],
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_beauty_actions_user_date ON beauty_actions(user_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_beauty_actions_type ON beauty_actions(user_id, action_type);

-- Add comment
COMMENT ON COLUMN beauty_actions.action_type IS 'Type of action: system (auto-calculated) or custom (user-added)';
COMMENT ON COLUMN beauty_actions.beauty_category IS 'Category: haircut, waxing, facial, hijama, etc.';
COMMENT ON COLUMN beauty_actions.score IS 'Suitability score 0-100 for system recommendations';
COMMENT ON COLUMN beauty_actions.reason IS 'Explanation for the recommendation';
COMMENT ON COLUMN beauty_actions.warnings IS 'Array of warning messages';