import { PILLAR_COLOURS, PILLAR_TINTS, PILLAR_LABELS, PILLAR_ICONS, ALL_PILLARS } from '../../lib/pillars'

interface Props {
  value: string
  onChange: (key: string) => void
}

const ITEMS = [
  { key: 'all', label: 'All', icon: '🌱', color: undefined, tint: undefined },
  ...ALL_PILLARS.map((p) => ({
    key: p as string,
    label: PILLAR_LABELS[p],
    icon: PILLAR_ICONS[p],
    color: PILLAR_COLOURS[p],
    tint: PILLAR_TINTS[p],
  })),
]

// Map icon names from pillarMeta to simple emoji/unicode for now
const ICON_MAP: Record<string, string> = {
  water: '💧', food: '🌿', health: '❤️', safety: '🛡️',
  energy: '☀️', skills: '🤝', sprout: '🌱',
}

export default function PillarFilterRow({ value, onChange }: Props) {
  return (
    <div className="flex gap-0 px-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {ITEMS.map((it) => {
        const on = value === it.key
        const icon = it.key === 'all' ? '🌱' : ICON_MAP[it.icon] ?? '●'
        const circleColor = it.key === 'all'
          ? 'var(--bark-200)'
          : on ? it.color! : it.tint!
        const iconColor = it.key === 'all'
          ? 'var(--bark-600)'
          : on ? 'var(--text-on-fill)' : it.color!

        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            aria-label={it.label}
            aria-pressed={on}
            className="flex flex-col items-center gap-1 px-1 py-0.5 bg-transparent border-none cursor-pointer flex-1 min-w-0"
          >
            <span
              className="inline-flex items-center justify-center transition-all"
              style={{
                width: 42, height: 42, borderRadius: '50%',
                backgroundColor: circleColor,
                color: iconColor,
                border: on ? `2px solid ${it.color ?? 'var(--bark-400)'}` : '2px solid transparent',
                fontSize: 17,
              }}
            >
              {icon}
            </span>
            <span
              className="text-center whitespace-nowrap"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 9,
                lineHeight: 1.1,
                color: on ? 'var(--bark-900)' : 'var(--bark-400)',
                fontWeight: on ? 600 : 500,
              }}
            >
              {it.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
