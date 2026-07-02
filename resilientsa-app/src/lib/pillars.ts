// src/lib/pillars.ts
// THE SINGLE SOURCE OF PILLAR TRUTH IN CODE
// McCoy canonical values — do not use brand-palette-v1.0.md for Health or Skills colours

export const PILLAR = {
  Water:       'water',
  Food:        'food',
  Health:      'health',
  Safety:      'safety',
  Energy:      'energy',
  SkillsTrade: 'skills',
} as const

export type Pillar = (typeof PILLAR)[keyof typeof PILLAR]

export const PILLAR_COLOURS: Record<Pillar, string> = {
  [PILLAR.Water]:       '#3D6B8C', // Rainwater Blue
  [PILLAR.Food]:        '#4A7256', // Fynbos Aloe
  [PILLAR.Health]:      '#B24C63', // Protea Rose — McCoy addition, SA national flower
  [PILLAR.Safety]:      '#C85A3C', // Ochre Earth
  [PILLAR.Energy]:      '#E6A854', // Sunbaked Clay
  [PILLAR.SkillsTrade]: '#5E5A8C', // Indigo Cloth — McCoy addition, shweshwe textile
} as const

export const PILLAR_TINTS: Record<Pillar, string> = {
  [PILLAR.Water]:       '#E0E8ED',
  [PILLAR.Food]:        '#E4EBE5',
  [PILLAR.Health]:      '#F3E1E6',
  [PILLAR.Safety]:      '#F5E3DC',
  [PILLAR.Energy]:      '#F9EFDA',
  [PILLAR.SkillsTrade]: '#E7E5F0',
} as const

export const PILLAR_LABELS: Record<Pillar, string> = {
  [PILLAR.Water]:       'Water',
  [PILLAR.Food]:        'Food',
  [PILLAR.Health]:      'Health',
  [PILLAR.Safety]:      'Safety',
  [PILLAR.Energy]:      'Energy',
  [PILLAR.SkillsTrade]: 'Skills & Trade',
} as const

export const PILLAR_ICONS: Record<Pillar, string> = {
  [PILLAR.Water]:       'droplets',
  [PILLAR.Food]:        'wheat',
  [PILLAR.Health]:      'heart-pulse',
  [PILLAR.Safety]:      'shield',
  [PILLAR.Energy]:      'sun',
  [PILLAR.SkillsTrade]: 'handshake',
} as const

export const CRISIS_PROTECTED_PILLARS: Pillar[] = [
  PILLAR.Water,
  PILLAR.Food,
  PILLAR.Health,
] as const

export const PILLAR_PRIORITY: Record<Pillar, number> = {
  [PILLAR.Water]:       1,
  [PILLAR.Food]:        2,
  [PILLAR.Health]:      3,
  [PILLAR.Safety]:      4,
  [PILLAR.Energy]:      5,
  [PILLAR.SkillsTrade]: 6,
} as const

export const ENERGY_CASCADE_PILLARS: Pillar[] = [
  PILLAR.Water,
  PILLAR.Food,
  PILLAR.Health,
] as const

export const DEFAULT_PILLAR = PILLAR.SkillsTrade

export const ALL_PILLARS = Object.values(PILLAR) as Pillar[]
