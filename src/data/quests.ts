export type Quest = {
  id: string
  title: string
  monster: string
  monsterThumbnail: string
  workout: string
  repGoal: string
  difficulty: 'Novice' | 'Adept' | 'Veteran' | 'Boss'
  image: string
  blurb: string
}

export const QUESTS: Quest[] = [
  {
    id: 'goblin-jumpjack',
    title: 'Jumping Jacks Goblin',
    monster: 'Goblin',
    monsterThumbnail: '/quests/Goblin_dead.png',
    workout: 'Jumping Jacks',
    repGoal: '3 rounds of 30',
    difficulty: 'Novice',
    image: '/quests/Jumpingjack_start_position.JPG',
    blurb: 'Quick footwork and steady rhythm to push back the goblin swarm.'
  },
  {
    id: 'goblin-climber',
    title: 'Mountain Climbers Goblin',
    monster: 'Goblin',
    monsterThumbnail: '/quests/Goblin_dead.png',
    workout: 'Mountain Climbers',
    repGoal: '3 rounds of 20 per side',
    difficulty: 'Novice',
    image: '/quests/climber_start.JPG',
    blurb: 'Hold your core strong and climb past the ambushers.'
  },
  {
    id: 'goblin-crunch',
    title: 'Crunches Goblin',
    monster: 'Goblin',
    monsterThumbnail: '/quests/Goblin_dead.png',
    workout: 'Crunches',
    repGoal: '3 rounds of 25',
    difficulty: 'Novice',
    image: '/quests/crunch_start.JPG',
    blurb: 'Power your core to collapse the goblin tunnel.'
  },
  {
    id: 'orc-pushup',
    title: 'Push-ups Orc',
    monster: 'Orc',
    monsterThumbnail: '/quests/orc-thumbnail.svg',
    workout: 'Push-ups',
    repGoal: '4 rounds of 12',
    difficulty: 'Adept',
    image: '/quests/quest-placeholder.svg',
    blurb: 'Press through the orc barricade with steady strength.'
  },
  {
    id: 'orc-back-extension',
    title: 'Back Extensions Orc',
    monster: 'Orc',
    monsterThumbnail: '/quests/orc-thumbnail.svg',
    workout: 'Back Extensions',
    repGoal: '4 rounds of 15',
    difficulty: 'Adept',
    image: '/quests/back_ex_start.JPG',
    blurb: 'Fortify your back to withstand the orc onslaught.'
  },
  {
    id: 'orc-jumpjack',
    title: 'Jumping Jacks Orc',
    monster: 'Orc',
    monsterThumbnail: '/quests/orc-thumbnail.svg',
    workout: 'Jumping Jacks',
    repGoal: '4 rounds of 25',
    difficulty: 'Adept',
    image: '/quests/Jumpingjack_up_position.JPG',
    blurb: 'Keep pace as the drums call the orcs forward.'
  },
  {
    id: 'dragon-squats',
    title: 'Squats Dragon',
    monster: 'Dragon',
    monsterThumbnail: '/quests/dragon-thumbnail.svg',
    workout: 'Squats',
    repGoal: '5 rounds of 12',
    difficulty: 'Boss',
    image: '/quests/squat_start.JPG',
    blurb: 'Stand tall and drive power through your legs to face the dragon.'
  }
]
