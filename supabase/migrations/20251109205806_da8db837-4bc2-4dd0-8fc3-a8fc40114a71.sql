-- Add completion tracking to beauty_actions table
ALTER TABLE beauty_actions 
ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on completed actions
CREATE INDEX idx_beauty_actions_completed ON beauty_actions(user_id, completed, phase);