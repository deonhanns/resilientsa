// src/components/marketplace/ProgrammeCard.tsx
// Offering card for the Community Marketplace — matches McCoy prototype
import { PILLAR_COLOURS, PILLAR_TINTS, type Pillar } from '../../lib/pillars'

interface Props {
  name: string
  shortDescription: string | null
  pillarTags: string[]
  providerName: string
  providerVerified: boolean
  endorsementCount: number
  totalEndorsements: number
  onRequest: () => void
  requestLabel?: string
}

const ICON_MAP: Record<string, string> = {
  water: '💧', food: '🌿', health: '❤️', safety: '🛡️',
  energy: '☀️', skills: '🤝',
}

export default function ProgrammeCard({
  name,
  shortDescription,
  pillarTags,
  providerName,
  providerVerified,
  endorsementCount,
  totalEndorsements,
  onRequest,
  requestLabel,
}: Props) {
  const primaryPillar = pillarTags[0] ?? 'skills'
  const pillarColor = PILLAR_COLOURS[primaryPillar as Pillar] ?? 'var(--bark-400)'
  const pillarTint = PILLAR_TINTS[primaryPillar as Pillar] ?? 'var(--surface-sunk)'
  const icon = ICON_MAP[primaryPillar] ?? '🌱'

  return (
    <div
      className="rounded-md p-4 flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--canvas-raised)',
        boxShadow: '0 1px 2px rgba(44,42,41,0.05), 0 4px 12px rgba(44,42,41,0.05)',
      }}
    >
      {/* Top row: pillar icon + name + pillar tag */}
      <div className="flex items-start gap-3">
        <span
          className="inline-flex items-center justify-center flex-shrink-0 rounded-md"
          style={{
            width: 44, height: 44,
            backgroundColor: pillarTint,
            color: pillarColor,
            fontSize: 20,
          }}
        >
          {icon}
        </span>
        <div className="flex flex-col gap-1.5 flex-1">
          <h3
            className="text-lg leading-snug"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--bark-900)',
            }}
          >
            {name}
          </h3>
          {/* Pillar tag */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit"
            style={{
              backgroundColor: pillarTint,
              color: pillarColor,
              fontFamily: 'var(--font-body)',
            }}
          >
            {primaryPillar.charAt(0).toUpperCase() + primaryPillar.slice(1)}
          </span>
        </div>
      </div>

      {/* Description */}
      {shortDescription && (
        <p
          className="text-sm leading-normal"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--bark-600)',
          }}
        >
          {shortDescription}
        </p>
      )}

      {/* Bottom row: endorsements + provider */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {endorsementCount > 0 && (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium"
            style={{ color: 'var(--aloe)', fontFamily: 'var(--font-body)' }}
          >
            👥 {endorsementCount} communities used this
          </span>
        )}
        {totalEndorsements > 0 && (
          <span
            className="text-xs"
            style={{ color: 'var(--bark-400)', fontFamily: 'var(--font-body)' }}
          >
            Recommended by {endorsementCount} of {totalEndorsements}
          </span>
        )}
        <span
          className="text-xs"
          style={{ color: 'var(--bark-400)', fontFamily: 'var(--font-body)' }}
        >
          by {providerName}
          {providerVerified && (
            <span style={{ color: 'var(--aloe)', marginLeft: 4 }}>✓</span>
          )}
        </span>
      </div>

      {/* Request button */}
      <button
        type="button"
        onClick={onRequest}
        className="w-full py-3 rounded-sm font-medium text-white text-sm transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--aloe)',
          fontFamily: 'var(--font-body)',
          minHeight: 44,
        }}
      >
        {requestLabel || 'Request for our community'}
      </button>
    </div>
  )
}
