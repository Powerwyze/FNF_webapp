-- Add intake form fields to profiles table
-- Run this in your Supabase SQL Editor

-- Add new columns for intake form data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS birthday date,
ADD COLUMN IF NOT EXISTS warrior_name text,
ADD COLUMN IF NOT EXISTS fitness_experience text check (fitness_experience in ('beginner','intermediate','advanced','expert')),
ADD COLUMN IF NOT EXISTS primary_goal text check (primary_goal in ('weight_loss','muscle_gain','strength','endurance','flexibility','general_fitness','sport_performance')),
ADD COLUMN IF NOT EXISTS current_activity_level text check (current_activity_level in ('sedentary','lightly_active','moderately_active','very_active','extremely_active')),
ADD COLUMN IF NOT EXISTS preferred_training_time text check (preferred_training_time in ('morning','afternoon','evening','night','flexible'));

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.age IS 'User age from intake form';
COMMENT ON COLUMN public.profiles.birthday IS 'User birthday from intake form';
COMMENT ON COLUMN public.profiles.warrior_name IS 'User chosen warrior name for role-playing';
COMMENT ON COLUMN public.profiles.fitness_experience IS 'User fitness experience level';
COMMENT ON COLUMN public.profiles.primary_goal IS 'User primary fitness goal';
COMMENT ON COLUMN public.profiles.current_activity_level IS 'User current activity level';
COMMENT ON COLUMN public.profiles.preferred_training_time IS 'User preferred time for training';
