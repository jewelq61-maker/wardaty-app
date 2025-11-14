-- Create beauty_categories table
CREATE TABLE IF NOT EXISTS beauty_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_en text,
  color text NOT NULL DEFAULT '#EC4899',
  icon text NOT NULL DEFAULT 'sparkles',
  is_system boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on beauty_categories
ALTER TABLE beauty_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own beauty categories"
ON beauty_categories
FOR ALL
USING (auth.uid() = user_id);

-- Create beauty_routines table
CREATE TABLE IF NOT EXISTS beauty_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  time_of_day text CHECK (time_of_day IN ('morning', 'evening', 'both')),
  reminder_enabled boolean DEFAULT false,
  reminder_time time DEFAULT '09:00:00',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on beauty_routines
ALTER TABLE beauty_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own beauty routines"
ON beauty_routines
FOR ALL
USING (auth.uid() = user_id);

-- Create routine_products table
CREATE TABLE IF NOT EXISTS routine_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid NOT NULL,
  name text NOT NULL,
  image_url text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on routine_products
ALTER TABLE routine_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage routine products"
ON routine_products
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM beauty_routines
    WHERE beauty_routines.id = routine_products.routine_id
    AND beauty_routines.user_id = auth.uid()
  )
);

-- Create routine_logs table for tracking completions
CREATE TABLE IF NOT EXISTS routine_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id uuid NOT NULL,
  log_date date NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(routine_id, log_date)
);

-- Enable RLS on routine_logs
ALTER TABLE routine_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own routine logs"
ON routine_logs
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_beauty_categories_user ON beauty_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_beauty_routines_user ON beauty_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_beauty_routines_category ON beauty_routines(category_id);
CREATE INDEX IF NOT EXISTS idx_routine_products_routine ON routine_products(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_logs_date ON routine_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_routine_logs_routine ON routine_logs(routine_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_beauty_routines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER beauty_routines_updated_at
BEFORE UPDATE ON beauty_routines
FOR EACH ROW
EXECUTE FUNCTION update_beauty_routines_updated_at();

CREATE OR REPLACE FUNCTION update_routine_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER routine_logs_updated_at
BEFORE UPDATE ON routine_logs
FOR EACH ROW
EXECUTE FUNCTION update_routine_logs_updated_at();