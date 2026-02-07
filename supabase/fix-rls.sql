-- Fix RLS policies for profiles table
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are self-access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles self-update" ON public.profiles;

-- Create new policies that allow profile creation and updates
CREATE POLICY "Profiles are self-access" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles self-update" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- Add policy for profile creation (this was missing!)
CREATE POLICY "Profiles self-insert" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Also ensure the profiles table has the correct foreign key reference
-- This should already be in place, but let's make sure
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fun, Goal-Focused Hero Assessment Questions
DELETE FROM public.questionnaire_questions;

INSERT INTO public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) VALUES
('energy_level', 'How do you feel about your current energy levels? ',
  '[{"key":"A","label":"I need a serious energy boost - always tired"},{"key":"B","label":"Somewhat low energy, could use improvement"},{"key":"C","label":"Moderate energy, up and down"},{"key":"D","label":"Pretty good energy most days"},{"key":"E","label":"I''m a human battery - always energized!"}]',
  '{"A":{"aesthetics_weight":3,"generalist_weight":2},"B":{"aesthetics_weight":2,"generalist_weight":2},"C":{"generalist_weight":3},"D":{"athletic_weight":2,"generalist_weight":2},"E":{"athletic_weight":3,"strength_weight":2}}',
  1
),
('motivation_style', 'What gets you most excited about working out? ',
  '[{"key":"A","label":"Seeing my body transform in the mirror"},{"key":"B","label":"Lifting heavier weights each week"},{"key":"C","label":"Feeling more flexible and mobile"},{"key":"D","label":"Beating my personal records and times"},{"key":"E","label":"Just feeling healthy and strong overall"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  2
);
