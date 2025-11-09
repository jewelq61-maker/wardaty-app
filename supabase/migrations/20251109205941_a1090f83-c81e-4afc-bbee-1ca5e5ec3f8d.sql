-- Add frequency and time of day to beauty_actions table
ALTER TABLE beauty_actions 
ADD COLUMN frequency TEXT,
ADD COLUMN time_of_day TEXT;

-- Add check constraint for valid frequency values
ALTER TABLE beauty_actions 
ADD CONSTRAINT beauty_actions_frequency_check 
CHECK (frequency IS NULL OR frequency IN ('once', 'daily', 'weekly', 'monthly'));

-- Add check constraint for valid time_of_day values
ALTER TABLE beauty_actions 
ADD CONSTRAINT beauty_actions_time_of_day_check 
CHECK (time_of_day IS NULL OR time_of_day IN ('morning', 'afternoon', 'evening', 'night'));