-- Seed classes
insert into public.classes (name, description, workouts) values
  ('Fighter','Goal: lose weight & gain muscular physique','Free weights & machines') on conflict (name) do nothing;
insert into public.classes (name, description, workouts) values
  ('Assassin','Goal: flexibility, balance, endurance','Calisthenics & HIIT') on conflict (name) do nothing;
insert into public.classes (name, description, workouts) values
  ('Healer/Mage','Goal: well-rounded fitness','Varied styles, frequent switches') on conflict (name) do nothing;
insert into public.classes (name, description, workouts) values
  ('Tank','Goal: bodybuilder/powerlifter strength','Muscle endurance & powerlifting') on conflict (name) do nothing;
insert into public.classes (name, description, workouts) values
  ('Ranger','Goal: athletic performance & endurance','Explosive/cardio/athletic') on conflict (name) do nothing;

-- Full 25 questionnaire questions with weight mappings
insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('primary_goal','Primary goal right now?',
  '[{"key":"A","label":"Lose fat"},{"key":"B","label":"Gain muscle size"},{"key":"C","label":"Improve flexibility/balance"},{"key":"D","label":"Improve athletic endurance/speed"},{"key":"E","label":"Be well-rounded/just get fit"}]',
  '{"A":{"aesthetics_weight":3},"B":{"strength_weight":3},"C":{"mobility_weight":3},"D":{"athletic_weight":3},"E":{"generalist_weight":3}}',
  1
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('training_style','Preferred training style',
  '[{"key":"A","label":"Free weights"},{"key":"B","label":"Machines"},{"key":"C","label":"Bodyweight/calisthenics"},{"key":"D","label":"HIIT circuits"},{"key":"E","label":"Mix it up often"}]',
  '{"A":{"aesthetics_weight":2},"B":{"aesthetics_weight":1,"strength_weight":1},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  2
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('days_per_week','How many days/week can you train?',
  '[{"key":"A","label":"2–3"},{"key":"B","label":"3–4"},{"key":"C","label":"4–5"},{"key":"D","label":"5–6"},{"key":"E","label":"It varies"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"athletic_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  3
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('session_length','Session length you enjoy',
  '[{"key":"A","label":"30–45m"},{"key":"B","label":"45–60m"},{"key":"C","label":"60–90m"},{"key":"D","label":">90m"},{"key":"E","label":"No preference"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"strength_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  4
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('motivator','Biggest motivator',
  '[{"key":"A","label":"Aesthetics"},{"key":"B","label":"Strength numbers"},{"key":"C","label":"Mobility"},{"key":"D","label":"Sport performance"},{"key":"E","label":"Overall health"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  5
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('cardio','Cardio feelings',
  '[{"key":"A","label":"Minimal"},{"key":"B","label":"Moderate"},{"key":"C","label":"Love it"},{"key":"D","label":"Sprints/intervals"},{"key":"E","label":"Mixed"}]',
  '{"A":{"aesthetics_weight":2},"B":{"generalist_weight":1,"athletic_weight":1},"C":{"athletic_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  6
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('leg_day','Leg day preference',
  '[{"key":"A","label":"Machines + accessories"},{"key":"B","label":"Heavy compounds"},{"key":"C","label":"Plyometrics"},{"key":"D","label":"Running/conditioning"},{"key":"E","label":"Variety/circuit"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  7
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('upper_focus','Upper body focus',
  '[{"key":"A","label":"Hypertrophy pump"},{"key":"B","label":"Max strength"},{"key":"C","label":"Gymnastics/calisthenics"},{"key":"D","label":"Athletic power"},{"key":"E","label":"Mixed modal"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  8
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('mobility_time','Flexibility/mobility work',
  '[{"key":"A","label":"0–10m"},{"key":"B","label":"10–20m"},{"key":"C","label":"20–30m"},{"key":"D","label":"30m+"},{"key":"E","label":"As needed"}]',
  '{"A":{"aesthetics_weight":1},"B":{"mobility_weight":1},"C":{"mobility_weight":2},"D":{"mobility_weight":2},"E":{"generalist_weight":2}}',
  9
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('rest_style','Rest style',
  '[{"key":"A","label":"Short rests"},{"key":"B","label":"Standard"},{"key":"C","label":"Supersets/circuits"},{"key":"D","label":"EMOM/AMRAP"},{"key":"E","label":"Depends"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  10
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('competition_vibe','Competition vibe',
  '[{"key":"A","label":"Friendly"},{"key":"B","label":"Lift totals"},{"key":"C","label":"Movement quality"},{"key":"D","label":"Timed challenges"},{"key":"E","label":"Cooperative"}]',
  '{"A":{"generalist_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  11
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('injury_history','Injury history',
  '[{"key":"A","label":"None"},{"key":"B","label":"Joint issues"},{"key":"C","label":"Low-back/hip"},{"key":"D","label":"Cardio/respiratory"},{"key":"E","label":"Various minor"}]',
  '{"A":{"generalist_weight":1},"B":{"mobility_weight":1},"C":{"mobility_weight":2},"D":{"athletic_weight":1},"E":{"generalist_weight":2}}',
  12
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('enjoyed_sports','Enjoyed in PE/sports?',
  '[{"key":"A","label":"Weight room"},{"key":"B","label":"Powerlifting/throwing"},{"key":"C","label":"Gymnastics/yoga"},{"key":"D","label":"Track/field/court"},{"key":"E","label":"A bit of everything"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  13
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('preferred_finisher','Preferred finisher',
  '[{"key":"A","label":"Isolation pump"},{"key":"B","label":"Heavy single/double"},{"key":"C","label":"Mobility flow"},{"key":"D","label":"Sled/sprints"},{"key":"E","label":"Surprise me"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  14
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('pace_tolerance','Pace tolerance',
  '[{"key":"A","label":"Moderate"},{"key":"B","label":"Heavy slow"},{"key":"C","label":"Flowing"},{"key":"D","label":"Fast"},{"key":"E","label":"Mixed"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  15
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('diet_priority','Diet priority',
  '[{"key":"A","label":"Caloric deficit"},{"key":"B","label":"High protein surplus"},{"key":"C","label":"Anti-inflammatory balance"},{"key":"D","label":"Performance fueling"},{"key":"E","label":"Sustainable balance"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  16
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('time_of_day','Morning vs evening',
  '[{"key":"A","label":"Morning"},{"key":"B","label":"Midday"},{"key":"C","label":"Evening"},{"key":"D","label":"Late night"},{"key":"E","label":"Flexible"}]',
  '{"A":{"aesthetics_weight":1},"B":{"generalist_weight":1},"C":{"generalist_weight":1},"D":{"athletic_weight":1},"E":{"generalist_weight":2}}',
  17
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('coach_feedback','Coach feedback style',
  '[{"key":"A","label":"Aesthetic tips"},{"key":"B","label":"Technical cues for lifts"},{"key":"C","label":"Mobility prescriptions"},{"key":"D","label":"Performance metrics"},{"key":"E","label":"Holistic mix"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  18
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('favorite_equipment','Favorite equipment',
  '[{"key":"A","label":"Dumbbells/cables"},{"key":"B","label":"Barbells"},{"key":"C","label":"Rings/bands"},{"key":"D","label":"Sled/rower/track"},{"key":"E","label":"All of it"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  19
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('hiit_interest','HIIT interest',
  '[{"key":"A","label":"Low"},{"key":"B","label":"Some"},{"key":"C","label":"High"},{"key":"D","label":"Sprint intervals"},{"key":"E","label":"Periodic blocks"}]',
  '{"A":{"aesthetics_weight":1},"B":{"generalist_weight":1},"C":{"athletic_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  20
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('stability_work','Stability/balance work',
  '[{"key":"A","label":"Occasionally"},{"key":"B","label":"Accessory"},{"key":"C","label":"Central"},{"key":"D","label":"Athletic drills"},{"key":"E","label":"Integrated blocks"}]',
  '{"A":{"aesthetics_weight":1},"B":{"strength_weight":1},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  21
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('progress_90','Progress you want in 90 days',
  '[{"key":"A","label":"Visible physique change"},{"key":"B","label":"Higher 1RMs"},{"key":"C","label":"Touch toes/flow better"},{"key":"D","label":"Better mile/time/vertical"},{"key":"E","label":"Better overall metrics"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  22
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('missed_week','Missed week plan',
  '[{"key":"A","label":"Resume pump split"},{"key":"B","label":"Resume strength cycle"},{"key":"C","label":"Mobility reset"},{"key":"D","label":"Conditioning reboot"},{"key":"E","label":"Hybrid reset"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  23
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('group_class','Group class preference',
  '[{"key":"A","label":"Body comp classes"},{"key":"B","label":"Strength club"},{"key":"C","label":"Mobility/flow"},{"key":"D","label":"Conditioning/sport prep"},{"key":"E","label":"Rotating sampler"}]',
  '{"A":{"aesthetics_weight":2},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  24
) on conflict (slug) do nothing;

insert into public.questionnaire_questions (slug, prompt, choices, weight_keys, order_index) values
('adventurous_programming','How adventurous with programming?',
  '[{"key":"A","label":"Not much"},{"key":"B","label":"Linear strength focus"},{"key":"C","label":"Novel flows/skills"},{"key":"D","label":"Athletic blocks"},{"key":"E","label":"Seasonal variety"}]',
  '{"A":{"aesthetics_weight":1},"B":{"strength_weight":2},"C":{"mobility_weight":2},"D":{"athletic_weight":2},"E":{"generalist_weight":2}}',
  25
) on conflict (slug) do nothing;


