/**
 * The Six Pillars of the Living Soil system.
 * Colour + icon carry meaning independently of language — a Water listing
 * looks like a Water listing before you read the word "Water".
 * Order is canonical. `key` is stable API; `label` is the human word.
 */
export const PILLARS = {
  water:  { key: 'water',  label: 'Water',          icon: 'water',  color: 'var(--pillar-water)',  tint: 'var(--pillar-water-tint)' },
  food:   { key: 'food',   label: 'Food',           icon: 'food',   color: 'var(--pillar-food)',   tint: 'var(--pillar-food-tint)' },
  health: { key: 'health', label: 'Health',         icon: 'health', color: 'var(--pillar-health)', tint: 'var(--pillar-health-tint)' },
  safety: { key: 'safety', label: 'Safety',         icon: 'safety', color: 'var(--pillar-safety)', tint: 'var(--pillar-safety-tint)' },
  energy: { key: 'energy', label: 'Energy',         icon: 'energy', color: 'var(--pillar-energy)', tint: 'var(--pillar-energy-tint)' },
  skills: { key: 'skills', label: 'Skills & Trade', icon: 'skills', color: 'var(--pillar-skills)', tint: 'var(--pillar-skills-tint)' },
};

/** Canonical ordered list — use for grids and radars. */
export const PILLAR_ORDER = ['water', 'food', 'health', 'safety', 'energy', 'skills'];

export const PILLAR_LIST = PILLAR_ORDER.map((k) => PILLARS[k]);
