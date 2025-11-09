-- Add manual adjustment field to profiles for fasting missed days
ALTER TABLE public.profiles 
ADD COLUMN fasting_manual_adjustment integer NOT NULL DEFAULT 0;