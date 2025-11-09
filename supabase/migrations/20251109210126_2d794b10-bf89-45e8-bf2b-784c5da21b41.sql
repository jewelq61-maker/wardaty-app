-- Add reminder settings to beauty_actions table
ALTER TABLE beauty_actions 
ADD COLUMN reminder_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN reminder_hours_before INTEGER DEFAULT 24;

-- Create a table to track duplicated actions to avoid duplicates
CREATE TABLE IF NOT EXISTS beauty_action_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_action_id UUID NOT NULL REFERENCES beauty_actions(id) ON DELETE CASCADE,
  duplicated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE beauty_action_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own action history" 
ON beauty_action_history 
FOR ALL 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_beauty_action_history_user_action ON beauty_action_history(user_id, original_action_id);
CREATE INDEX idx_beauty_action_history_next_due ON beauty_action_history(next_due_date);