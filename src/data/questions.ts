export type Choice = { key: string; label: string }
export type Question = { id: number; slug: string; prompt: string; choices: Choice[] }

export const QUESTIONS: Question[] = [
  { id: 1, slug: 'primary_goal', prompt: 'Primary goal right now?', choices: [
    { key: 'A', label: 'Lose fat' }, { key: 'B', label: 'Gain muscle size' }, { key: 'C', label: 'Improve flexibility/balance' }, { key: 'D', label: 'Improve athletic endurance/speed' }, { key: 'E', label: 'Be well-rounded/just get fit' }
  ]},
  { id: 2, slug: 'training_style', prompt: 'Preferred training style', choices: [
    { key: 'A', label: 'Free weights' }, { key: 'B', label: 'Machines' }, { key: 'C', label: 'Bodyweight/calisthenics' }, { key: 'D', label: 'HIIT circuits' }, { key: 'E', label: 'Mix it up often' }
  ]},
  { id: 3, slug: 'days_per_week', prompt: 'How many days/week can you train?', choices: [
    { key: 'A', label: '2–3' }, { key: 'B', label: '3–4' }, { key: 'C', label: '4–5' }, { key: 'D', label: '5–6' }, { key: 'E', label: 'It varies' }
  ]},
  { id: 4, slug: 'session_length', prompt: 'Session length you enjoy', choices: [
    { key: 'A', label: '30–45m' }, { key: 'B', label: '45–60m' }, { key: 'C', label: '60–90m' }, { key: 'D', label: '>90m' }, { key: 'E', label: 'No preference' }
  ]},
  { id: 5, slug: 'motivator', prompt: 'Biggest motivator', choices: [
    { key: 'A', label: 'Aesthetics' }, { key: 'B', label: 'Strength numbers' }, { key: 'C', label: 'Mobility' }, { key: 'D', label: 'Sport performance' }, { key: 'E', label: 'Overall health' }
  ]},
  { id: 6, slug: 'cardio', prompt: 'Cardio feelings', choices: [
    { key: 'A', label: 'Minimal' }, { key: 'B', label: 'Moderate' }, { key: 'C', label: 'Love it' }, { key: 'D', label: 'Sprints/intervals' }, { key: 'E', label: 'Mixed' }
  ]},
  { id: 7, slug: 'leg_day', prompt: 'Leg day preference', choices: [
    { key: 'A', label: 'Machines + accessories' }, { key: 'B', label: 'Heavy compounds' }, { key: 'C', label: 'Plyometrics' }, { key: 'D', label: 'Running/conditioning' }, { key: 'E', label: 'Variety/circuit' }
  ]},
  { id: 8, slug: 'upper_focus', prompt: 'Upper body focus', choices: [
    { key: 'A', label: 'Hypertrophy pump' }, { key: 'B', label: 'Max strength' }, { key: 'C', label: 'Gymnastics/calisthenics' }, { key: 'D', label: 'Athletic power' }, { key: 'E', label: 'Mixed modal' }
  ]},
  { id: 9, slug: 'mobility_time', prompt: 'Flexibility/mobility work', choices: [
    { key: 'A', label: '0–10m' }, { key: 'B', label: '10–20m' }, { key: 'C', label: '20–30m' }, { key: 'D', label: '30m+' }, { key: 'E', label: 'As needed' }
  ]},
  { id: 10, slug: 'rest_style', prompt: 'Rest style', choices: [
    { key: 'A', label: 'Short rests' }, { key: 'B', label: 'Standard' }, { key: 'C', label: 'Supersets/circuits' }, { key: 'D', label: 'EMOM/AMRAP' }, { key: 'E', label: 'Depends' }
  ]},
  { id: 11, slug: 'competition_vibe', prompt: 'Competition vibe', choices: [
    { key: 'A', label: 'Friendly' }, { key: 'B', label: 'Lift totals' }, { key: 'C', label: 'Movement quality' }, { key: 'D', label: 'Timed challenges' }, { key: 'E', label: 'Cooperative' }
  ]},
  { id: 12, slug: 'injury_history', prompt: 'Injury history', choices: [
    { key: 'A', label: 'None' }, { key: 'B', label: 'Joint issues' }, { key: 'C', label: 'Low-back/hip' }, { key: 'D', label: 'Cardio/respiratory' }, { key: 'E', label: 'Various minor' }
  ]},
  { id: 13, slug: 'enjoyed_sports', prompt: 'Enjoyed in PE/sports?', choices: [
    { key: 'A', label: 'Weight room' }, { key: 'B', label: 'Powerlifting/throwing' }, { key: 'C', label: 'Gymnastics/yoga' }, { key: 'D', label: 'Track/field/court' }, { key: 'E', label: 'A bit of everything' }
  ]},
  { id: 14, slug: 'preferred_finisher', prompt: 'Preferred finisher', choices: [
    { key: 'A', label: 'Isolation pump' }, { key: 'B', label: 'Heavy single/double' }, { key: 'C', label: 'Mobility flow' }, { key: 'D', label: 'Sled/sprints' }, { key: 'E', label: 'Surprise me' }
  ]},
  { id: 15, slug: 'pace_tolerance', prompt: 'Pace tolerance', choices: [
    { key: 'A', label: 'Moderate' }, { key: 'B', label: 'Heavy slow' }, { key: 'C', label: 'Flowing' }, { key: 'D', label: 'Fast' }, { key: 'E', label: 'Mixed' }
  ]},
  { id: 16, slug: 'diet_priority', prompt: 'Diet priority', choices: [
    { key: 'A', label: 'Caloric deficit' }, { key: 'B', label: 'High protein surplus' }, { key: 'C', label: 'Anti-inflammatory balance' }, { key: 'D', label: 'Performance fueling' }, { key: 'E', label: 'Sustainable balance' }
  ]},
  { id: 17, slug: 'time_of_day', prompt: 'Morning vs evening', choices: [
    { key: 'A', label: 'Morning' }, { key: 'B', label: 'Midday' }, { key: 'C', label: 'Evening' }, { key: 'D', label: 'Late night' }, { key: 'E', label: 'Flexible' }
  ]},
  { id: 18, slug: 'coach_feedback', prompt: 'Coach feedback style', choices: [
    { key: 'A', label: 'Aesthetic tips' }, { key: 'B', label: 'Technical cues for lifts' }, { key: 'C', label: 'Mobility prescriptions' }, { key: 'D', label: 'Performance metrics' }, { key: 'E', label: 'Holistic mix' }
  ]},
  { id: 19, slug: 'favorite_equipment', prompt: 'Favorite equipment', choices: [
    { key: 'A', label: 'Dumbbells/cables' }, { key: 'B', label: 'Barbells' }, { key: 'C', label: 'Rings/bands' }, { key: 'D', label: 'Sled/rower/track' }, { key: 'E', label: 'All of it' }
  ]},
  { id: 20, slug: 'hiit_interest', prompt: 'HIIT interest', choices: [
    { key: 'A', label: 'Low' }, { key: 'B', label: 'Some' }, { key: 'C', label: 'High' }, { key: 'D', label: 'Sprint intervals' }, { key: 'E', label: 'Periodic blocks' }
  ]},
  { id: 21, slug: 'stability_work', prompt: 'Stability/balance work', choices: [
    { key: 'A', label: 'Occasionally' }, { key: 'B', label: 'Accessory' }, { key: 'C', label: 'Central' }, { key: 'D', label: 'Athletic drills' }, { key: 'E', label: 'Integrated blocks' }
  ]},
  { id: 22, slug: 'progress_90', prompt: 'Progress you want in 90 days', choices: [
    { key: 'A', label: 'Visible physique change' }, { key: 'B', label: 'Higher 1RMs' }, { key: 'C', label: 'Touch toes/flow better' }, { key: 'D', label: 'Better mile/time/vertical' }, { key: 'E', label: 'Better overall metrics' }
  ]},
  { id: 23, slug: 'missed_week', prompt: 'Missed week plan', choices: [
    { key: 'A', label: 'Resume pump split' }, { key: 'B', label: 'Resume strength cycle' }, { key: 'C', label: 'Mobility reset' }, { key: 'D', label: 'Conditioning reboot' }, { key: 'E', label: 'Hybrid reset' }
  ]},
  { id: 24, slug: 'group_class', prompt: 'Group class preference', choices: [
    { key: 'A', label: 'Body comp classes' }, { key: 'B', label: 'Strength club' }, { key: 'C', label: 'Mobility/flow' }, { key: 'D', label: 'Conditioning/sport prep' }, { key: 'E', label: 'Rotating sampler' }
  ]},
  { id: 25, slug: 'adventurous_programming', prompt: 'How adventurous with programming?', choices: [
    { key: 'A', label: 'Not much' }, { key: 'B', label: 'Linear strength focus' }, { key: 'C', label: 'Novel flows/skills' }, { key: 'D', label: 'Athletic blocks' }, { key: 'E', label: 'Seasonal variety' }
  ]},
]

export type Weights = {
  aesthetics_weight: number
  strength_weight: number
  mobility_weight: number
  athletic_weight: number
  generalist_weight: number
}

export const INITIAL_WEIGHTS: Weights = {
  aesthetics_weight: 0,
  strength_weight: 0,
  mobility_weight: 0,
  athletic_weight: 0,
  generalist_weight: 0,
}

// Weight mapping per question/choice. Core rule: +2 to primary axis; occasional +1 to a secondary axis.
// For brevity, many are primary-only; this still produces a clear winner while allowing ties.
export const WEIGHT_MAP: Record<number, Record<string, Partial<Weights>>> = {
  1: { A:{aesthetics_weight:3}, B:{strength_weight:3}, C:{mobility_weight:3}, D:{athletic_weight:3}, E:{generalist_weight:3} },
  2: { A:{aesthetics_weight:2}, B:{aesthetics_weight:1, strength_weight:1}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  3: { A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{athletic_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  4: { A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{strength_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  5: { A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  6: { A:{aesthetics_weight:2}, B:{generalist_weight:1, athletic_weight:1}, C:{athletic_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  7: { A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  8: { A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  9: { A:{aesthetics_weight:1}, B:{mobility_weight:1}, C:{mobility_weight:2}, D:{mobility_weight:2}, E:{generalist_weight:2} },
  10:{ A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  11:{ A:{generalist_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  12:{ A:{generalist_weight:1}, B:{mobility_weight:1}, C:{mobility_weight:2}, D:{athletic_weight:1}, E:{generalist_weight:2} },
  13:{ A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  14:{ A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  15:{ A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  16:{ A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  17:{ A:{aesthetics_weight:1}, B:{generalist_weight:1}, C:{generalist_weight:1}, D:{athletic_weight:1}, E:{generalist_weight:2} },
  18:{ A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  19:{ A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  20:{ A:{aesthetics_weight:1}, B:{generalist_weight:1}, C:{athletic_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  21:{ A:{aesthetics_weight:1}, B:{strength_weight:1}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  22:{ A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  23:{ A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  24:{ A:{aesthetics_weight:2}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
  25:{ A:{aesthetics_weight:1}, B:{strength_weight:2}, C:{mobility_weight:2}, D:{athletic_weight:2}, E:{generalist_weight:2} },
}

export type ClassName = 'Fighter'|'Assassin'|'Healer/Mage'|'Tank'|'Ranger'

export function computeClass(weights: Weights): ClassName {
  const entries: Array<[ClassName, number]> = [
    ['Fighter', weights.aesthetics_weight],
    ['Tank', weights.strength_weight],
    ['Assassin', weights.mobility_weight],
    ['Ranger', weights.athletic_weight],
    ['Healer/Mage', weights.generalist_weight],
  ]
  entries.sort((a,b)=> b[1]-a[1])
  // If tie within 2 points, pick first for now (client-only), tie-break with Gemini on server later
  const top = entries[0]
  const second = entries[1]
  if (second && Math.abs(top[1]-second[1]) <= 2) {
    return top[0]
  }
  return top[0]
}

export function scoreAnswers(answers: Record<number,string>): { weights: Weights; className: ClassName } {
  const w: Weights = { ...INITIAL_WEIGHTS }
  for (const [qidStr, key] of Object.entries(answers)) {
    const qid = Number(qidStr)
    const map = WEIGHT_MAP[qid]
    if (!map) continue
    const inc = map[key]
    if (!inc) continue
    for (const [axis, val] of Object.entries(inc)) {
      ;(w as any)[axis] = ((w as any)[axis] ?? 0) + (val as number)
    }
  }
  const className = computeClass(w)
  return { weights: w, className }
}



