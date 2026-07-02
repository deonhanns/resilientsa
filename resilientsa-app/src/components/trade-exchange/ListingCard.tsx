import { PILLAR_COLOURS, PILLAR_TINTS, type Pillar } from '../../lib/pillars'

interface Props {
  title: string
  pillar: string
  type: 'offer' | 'need'
  member?: string
  place?: string
  steward?: boolean
  pendingSync?: boolean
  onAction?: () => void
  onMatch?: () => void
}

const ICON_MAP: Record<string, string> = {
  water: '💧', food: '🌿', health: '❤️', safety: '🛡️',
  energy: '☀️', skills: '🤝',
}

export default function ListingCard({ title, pillar, type, member, place, steward, pendingSync, onAction, onMatch }: Props) {
  const pillBg = type === 'offer'
    ? PILLAR_TINTS[pillar as Pillar] ?? 'var(--aloe-tint)'
    : PILLAR_TINTS[pillar as Pillar] ?? 'var(--ochre-tint)'
  const icon = ICON_MAP[pillar] ?? '●'
  const defaultAction = type === 'offer' ? 'I want this' : 'I can help'

  return (
    <div
      className="rounded-md overflow-hidden"
      style={{
        backgroundColor: 'var(--canvas-raised)',
        boxShadow: '0 1px 2px rgba(44,42,41,0.05), 0 4px 12px rgba(44,42,41,0.05)',
      }}
    >
      <div className="flex">
        {/* 6px pillar colour left border — load-bearing visual element */}
        <div
          className="flex-shrink-0"
          style={{
            width: 6,
            backgroundColor: PILLAR_COLOURS[pillar as Pillar] ?? 'var(--border-hairline)',
          }}
        />

        <div className="flex-1 flex flex-col gap-3 p-4">
          {/* Top row: pill + title + pillar icon */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              {/* Offering/Needed pill */}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: pillBg,
                  color: 'var(--bark-700)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span className="text-xs">{type === 'offer' ? '↑' : '↓'}</span>
                {type === 'offer' ? 'Offering' : 'Needed'}
              </span>

              <h3
                className="text-lg leading-snug"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--bark-900)',
                }}
              >
                {title}
                {pendingSync && (
                  <span
                    className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--clay-tint)', color: 'var(--clay)' }}
                  >
                    Syncing
                  </span>
                )}
              </h3>
            </div>

            {/* Pillar icon top-right */}
            <span
              className="inline-flex items-center justify-center flex-shrink-0 rounded-full text-sm"
              style={{
                width: 32, height: 32,
                backgroundColor: PILLAR_TINTS[pillar as Pillar] ?? 'var(--aloe-tint)',
                color: PILLAR_COLOURS[pillar as Pillar] ?? 'var(--aloe)',
              }}
            >
              {icon}
            </span>
          </div>

          {/* Member + cell */}
          {(member || place) && (
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: 'var(--bark-400)', fontFamily: 'var(--font-body)' }}
            >
              {member && <span>👤 {member}</span>}
              {place && <span>📍 {place}</span>}
            </div>
          )}

          {/* Action button */}
          {type === 'offer' ? (
            <button
              type="button"
              onClick={onAction}
              className="w-full py-3 rounded-sm font-medium text-white text-sm transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--action-primary)',
                fontFamily: 'var(--font-body)',
                minHeight: 44,
              }}
            >
              {defaultAction}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onAction}
                className="w-full py-3 rounded-sm font-medium text-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'transparent',
                  border: '1.5px solid var(--need)',
                  color: 'var(--need)',
                  fontFamily: 'var(--font-body)',
                  minHeight: 44,
                }}
              >
                {defaultAction}
              </button>

              {/* Steward-only: Match a member */}
              {steward && (
                <button
                  type="button"
                  onClick={onMatch}
                  className="flex items-center justify-center gap-2 w-full py-2.5 -mt-1 rounded-md text-sm font-medium cursor-pointer"
                  style={{
                    border: '1.5px dashed var(--border-strong)',
                    backgroundColor: 'transparent',
                    color: 'var(--bark-600)',
                    fontFamily: 'var(--font-body)',
                    minHeight: 40,
                  }}
                >
                  👥 Match a member
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
