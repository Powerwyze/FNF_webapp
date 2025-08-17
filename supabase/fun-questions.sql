-- Fun, Goal-Focused Warrior Assessment Questions
-- Replace the existing questions with these more engaging ones

-- Clear existing questions
DELETE FROM public.questionnaire_questions;

-- Insert new fun questions
INSERT INTO public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) VALUES
('energy_level', 'How do you feel about your current energy levels? 🚀',
  '[{"key":"A","label":"I need a serious energy boost - always tired"},{"key":"B","label":"Somewhat low energy, could use improvement"},{"key":"C","label":"Moderate energy, up and down"},{"key":"D","label":"Pretty good energy most days"},{"key":"E","label":"I''m a human battery - always energized!"}]',
  '{"A":{"aesthetics_weight":3,"generalist_weight":2},"B":{"aesthetics_weight":2,"generalist_weight":2},"C":{"generalist_weight":3},"D":{"athletic_weight":2,"generalist_weight":2},"E":{"athletic_weight":3,"strength_weight":2}}',
  1
),

('motivation_style', 'What gets you most excited about working out? 💪',
  '[{"key":"A","label":"Seeing my body transform in the mirror"},{"key":"B","label":"Lifting heavier weights each week"},{"key":"C","label":"Feeling more flexible and mobile"},{"key":"D","label":"Beating my personal records and times"},{"key":"E","label":"Just feeling healthy and strong overall"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  2
),

('workout_environment', 'What''s your ideal workout environment? 🏋️',
  '[{"key":"A","label":"Quiet gym with mirrors to check form"},{"key":"B","label":"Powerlifting gym with heavy equipment"},{"key":"C","label":"Open space for bodyweight movements"},{"key":"D","label":"High-energy group fitness studio"},{"key":"E","label":"Mix of different environments"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  3
),

('recovery_feeling', 'How do you typically feel after a good workout? 😌',
  '[{"key":"A","label":"Sore but satisfied with my effort"},{"key":"B","label":"Strong and powerful, ready for more"},{"key":"C","label":"Relaxed and stretched out"},{"key":"D","label":"Energized and ready to tackle anything"},{"key":"E","label":"Balanced and refreshed"}]',
  '{"A":{"aesthetics_weight":2,"generalist_weight":2},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  4
),

('goal_visualization', 'When you imagine your fitness future, what do you see? 🔮',
  '[{"key":"A","label":"A toned, sculpted physique"},{"key":"B","label":"Lifting massive weights with ease"},{"key":"C","label":"Moving gracefully like a dancer"},{"key":"D","label":"Running marathons or winning races"},{"key":"E","label":"Being healthy and active at any age"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  5
),

('stress_relief', 'How do you prefer to blow off steam? 💨',
  '[{"key":"A","label":"Intense workout to exhaust myself"},{"key":"B","label":"Heavy lifting to feel powerful"},{"key":"C","label":"Gentle stretching and breathing"},{"key":"D","label":"High-intensity cardio to clear my mind"},{"key":"E","label":"Whatever feels right in the moment"}]',
  '{"A":{"aesthetics_weight":2,"athletic_weight":2},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  6
),

('social_workout', 'What''s your preference for workout partners? 👥',
  '[{"key":"A","label":"Solo workouts to focus on myself"},{"key":"B","label":"Training partner for motivation"},{"key":"C","label":"Small group for accountability"},{"key":"D","label":"Large energetic classes"},{"key":"E","label":"Mix of solo and social"}]',
  '{"A":{"aesthetics_weight":2,"strength_weight":2},"B":{"strength_weight":2,"generalist_weight":2},"C":{"mobility_weight":2,"generalist_weight":2},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  7
),

('challenge_type', 'What type of challenge excites you most? 🏆',
  '[{"key":"A","label":"Physical transformation challenges"},{"key":"B","label":"Strength and power competitions"},{"key":"C","label":"Flexibility and balance feats"},{"key":"D","label":"Speed and endurance races"},{"key":"E","label":"Overall wellness challenges"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  8
),

('music_preference', 'What gets you pumped during workouts? 🎵',
  '[{"key":"A","label":"High-energy pop and hip-hop"},{"key":"B","label":"Heavy metal and rock"},{"key":"C","label":"Calm, meditative sounds"},{"key":"D","label":"Fast-paced electronic music"},{"key":"E","label":"Mix of different genres"}]',
  '{"A":{"aesthetics_weight":2,"athletic_weight":2},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  9
),

('progress_tracking', 'How do you like to measure your progress? 📊',
  '[{"key":"A","label":"Progress photos and body measurements"},{"key":"B","label":"Weight lifted and strength gains"},{"key":"C","label":"Flexibility improvements and range of motion"},{"key":"D","label":"Speed, distance, and time records"},{"key":"E","label":"Overall feeling of health and wellness"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  10
),

('workout_duration', 'What''s your sweet spot for workout length? ⏱️',
  '[{"key":"A","label":"30-45 minutes - quick and efficient"},{"key":"B","label":"45-60 minutes - focused strength work"},{"key":"C","label":"60-75 minutes - including warm-up and cool-down"},{"key":"D","label":"75+ minutes - comprehensive training"},{"key":"E","label":"Varies based on how I feel"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":2,"generalist_weight":2},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  11
),

('rest_preference', 'How do you feel about rest days? 😴',
  '[{"key":"A","label":"I need them to recover properly"},{"key":"B","label":"I prefer active recovery with light work"},{"key":"C","label":"I enjoy gentle stretching and yoga"},{"key":"D","label":"I like light cardio to stay active"},{"key":"E","label":"Whatever my body tells me it needs"}]',
  '{"A":{"aesthetics_weight":2,"strength_weight":2},"B":{"strength_weight":2,"athletic_weight":2},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  12
),

('goal_timeline', 'What''s your timeline for seeing results? 🗓️',
  '[{"key":"A","label":"Quick results - within 4-6 weeks"},{"key":"B","label":"Steady progress - 2-3 months"},{"key":"C","label":"Long-term development - 6+ months"},{"key":"D","label":"Continuous improvement - ongoing"},{"key":"E","label":"I''m patient and focused on the journey"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":2,"generalist_weight":2},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  13
),

('injury_concern', 'What''s your biggest fitness worry? 😰',
  '[{"key":"A","label":"Not seeing visible results quickly enough"},{"key":"B","label":"Getting injured from lifting too heavy"},{"key":"C","label":"Losing flexibility and mobility"},{"key":"D","label":"Losing endurance and stamina"},{"key":"E","label":"Not maintaining overall health and balance"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  14
),

('competition_style', 'How do you approach fitness challenges? 🥊',
  '[{"key":"A","label":"I compete with myself to look better"},{"key":"B","label":"I compete with others to lift more"},{"key":"C","label":"I compete with my own limitations"},{"key":"D","label":"I compete in races and timed events"},{"key":"E","label":"I focus on personal growth, not competition"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  15
),

('workout_variety', 'How do you feel about trying new exercises? 🔄',
  '[{"key":"A","label":"I prefer sticking to what works"},{"key":"B","label":"I like adding new strength movements"},{"key":"C","label":"I enjoy exploring new mobility techniques"},{"key":"D","label":"I love trying new cardio activities"},{"key":"E","label":"I''m always excited to try something new"}]',
  '{"A":{"aesthetics_weight":2,"strength_weight":2},"B":{"strength_weight":2,"generalist_weight":2},"C":{"mobility_weight":2,"generalist_weight":2},"D":{"athletic_weight":2,"generalist_weight":2},"E":{"generalist_weight":3}}',
  16
),

('energy_source', 'What gives you the most energy? ⚡',
  '[{"key":"A","label":"Seeing progress in the mirror"},{"key":"B","label":"Feeling strong and powerful"},{"key":"C","label":"Feeling relaxed and centered"},{"key":"D","label":"Feeling fast and agile"},{"key":"E","label":"Feeling healthy and balanced"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  17
),

('fitness_role_model', 'Who inspires you most in fitness? 👑',
  '[{"key":"A","label":"Bodybuilders and physique athletes"},{"key":"B","label":"Powerlifters and strongmen"},{"key":"C","label":"Yogis and mobility experts"},{"key":"D","label":"Elite athletes and runners"},{"key":"E","label":"People who maintain health at any age"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  18
),

('workout_mood', 'What mood are you usually in when you work out? 😊',
  '[{"key":"A","label":"Focused and determined"},{"key":"B","label":"Aggressive and powerful"},{"key":"C","label":"Calm and mindful"},{"key":"D","label":"Energetic and excited"},{"key":"E","label":"Adaptable to whatever I''m feeling"}]',
  '{"A":{"aesthetics_weight":2,"strength_weight":2},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  19
),

('goal_achievement', 'What would make you feel most accomplished? 🎯',
  '[{"key":"A","label":"Looking amazing in photos"},{"key":"B","label":"Lifting weights I never thought possible"},{"key":"C","label":"Achieving poses I couldn''t do before"},{"key":"D","label":"Completing a challenging race or event"},{"key":"E","label":"Maintaining consistent healthy habits"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  20
),

('workout_environment_2', 'What motivates you most in your workout space? 🏠',
  '[{"key":"A","label":"Mirrors to see my progress"},{"key":"B","label":"Heavy equipment and weights"},{"key":"C","label":"Open space for movement"},{"key":"D","label":"High-energy atmosphere"},{"key":"E","label":"Comfortable and welcoming environment"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  21
),

('recovery_priority', 'What''s most important to you for recovery? 🧘',
  '[{"key":"A","label":"Getting enough sleep for muscle growth"},{"key":"B","label":"Proper nutrition for strength gains"},{"key":"C","label":"Stretching and mobility work"},{"key":"D","label":"Active recovery and light movement"},{"key":"E","label":"Overall wellness and balance"}]',
  '{"A":{"aesthetics_weight":2,"strength_weight":2},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  22
),

('fitness_identity', 'How do you want to be seen by others? 👀',
  '[{"key":"A","label":"As someone with an amazing physique"},{"key":"B","label":"As someone who''s incredibly strong"},{"key":"C","label":"As someone who moves gracefully"},{"key":"D","label":"As someone who''s fast and athletic"},{"key":"E","label":"As someone who''s healthy and fit"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  23
),

('workout_success', 'What makes a workout feel successful to you? ✅',
  '[{"key":"A","label":"Feeling the burn and seeing progress"},{"key":"B","label":"Lifting heavier than before"},{"key":"C","label":"Feeling more flexible and relaxed"},{"key":"D","label":"Beating my previous times or distances"},{"key":"E","label":"Feeling good and accomplished overall"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  24
),

('future_vision', 'What''s your ultimate fitness vision? 🌟',
  '[{"key":"A","label":"A sculpted, magazine-worthy physique"},{"key":"B","label":"Superhuman strength and power"},{"key":"C","label":"Effortless grace and mobility"},{"key":"D","label":"Elite athletic performance"},{"key":"E","label":"Lifelong health and vitality"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  25
);
