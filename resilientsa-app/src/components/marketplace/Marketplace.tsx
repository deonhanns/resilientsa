// src/components/marketplace/Marketplace.tsx
// Community Marketplace — main screen: entry question → pillar grid → offering list
// Matches McCoy prototype at design/prototype-v1/ui_kits/resilientsa-app/Marketplace.jsx
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { marketplaceApi } from '../../lib/api'
import { addToOutbox } from '../../lib/outbox'
import ProgrammeCard from './ProgrammeCard'
import RequestForm from './RequestForm'
import PillarFilterRow from '../trade-exchange/PillarFilterRow'
import type { MarketplaceOffering } from '../../lib/types'

export default function Marketplace() {
  const { t } = useTranslation()
  const [pillar, setPillar] = useState<string | null>(null)
  const [offerings, setOfferings] = useState<MarketplaceOffering[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Request flow state
  const [requestOffering, setRequestOffering] = useState<MarketplaceOffering | null>(null)
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [requestSent, setRequestSent] = useState<string | null>(null)

  const fetchOfferings = useCallback(async (p: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await marketplaceApi.browse(p ?? undefined)
      setOfferings(res.offerings)
    } catch {
      setError('Could not load support offerings. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch when pillar changes (or initial load with null pillar = entry screen)
  useEffect(() => {
    if (pillar) {
      fetchOfferings(pillar)
    }
  }, [pillar, fetchOfferings])

  async function handleRequest(context: string) {
    if (!requestOffering) return
    setRequestSubmitting(true)
    setRequestError(null)

    try {
      await marketplaceApi.request(requestOffering.id, context)
      setRequestSent(requestOffering.name)
      setRequestOffering(null)
    } catch (err: any) {
      if (err.message?.includes('409')) {
        setRequestError(t('support.conflictMessage', 'Your community has already requested this support.'))
      } else {
        // Queue offline
        await addToOutbox(
          `/marketplace/offerings/${requestOffering.id}/request`,
          'POST',
          { requestContext: context }
        )
        setRequestSent(requestOffering.name)
        setRequestOffering(null)
      }
    } finally {
      setRequestSubmitting(false)
    }
  }

  // Entry screen: pillar question
  if (!pillar) {
    return (
      <div className="min-h-screen pb-6" style={{ backgroundColor: 'var(--canvas)' }}>
        <div style={{ padding: '8px 20px 24px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--bark-900)',
              fontSize: '1.375rem',
              lineHeight: 1.25,
              margin: '8px 0 6px',
            }}
          >
            {t('support.question', 'What kind of support does your community need?')}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--bark-500)',
              margin: '0 0 20px',
              fontSize: '0.9375rem',
            }}
          >
            {t('support.subtitle', 'Tap one to see what other communities have used.')}
          </p>

          {/* Pillar filter row — same visual as Trade Exchange */}
          <PillarFilterRow value="all" onChange={(key) => key !== 'all' && setPillar(key)} />
        </div>
      </div>
    )
  }

  // Confirmation state after successful request
  if (requestSent) {
    return (
      <div className="min-h-screen pb-6" style={{ backgroundColor: 'var(--canvas)' }}>
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <span style={{ fontSize: 48, marginBottom: 16 }}>✅</span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--bark-900)',
              fontSize: '1.25rem',
              marginBottom: 8,
            }}
          >
            {t('support.requestSent', 'Your request has been sent')}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--bark-500)',
              fontSize: '0.9375rem',
              marginBottom: 24,
            }}
          >
            {t('support.requestSentDetail', 'The provider will review your request for')} "{requestSent}".
          </p>
          <button
            type="button"
            onClick={() => { setRequestSent(null); setPillar(null) }}
            className="px-6 py-3 rounded-sm text-sm font-medium"
            style={{
              fontFamily: 'var(--font-body)',
              backgroundColor: 'var(--aloe)',
              color: '#fff',
              minHeight: 44,
            }}
          >
            {t('support.backToBrowse', 'Browse more support')}
          </button>
        </div>
      </div>
    )
  }

  // Pillar selected → show offering list
  return (
    <div className="min-h-screen pb-6" style={{ backgroundColor: 'var(--canvas)' }}>
      {/* Back navigation + pillar tag + count */}
      <div className="flex items-center gap-2.5 px-5 py-2.5">
        <button
          type="button"
          onClick={() => setPillar(null)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-sm font-medium border-none cursor-pointer"
          style={{
            fontFamily: 'var(--font-body)',
            backgroundColor: 'var(--surface-sunk)',
            color: 'var(--bark-600)',
          }}
        >
          ← {t('support.backToTypes', 'Back to support types')}
        </button>

        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `var(--pillar-${pillar})`,
            color: '#fff',
            fontFamily: 'var(--font-body)',
          }}
        >
          {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
        </span>

        <span
          className="ml-auto text-xs"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--bark-400)' }}
        >
          {offerings.length} {t('support.available', 'available')}
        </span>
      </div>

      {/* Offering list */}
      <div className="flex flex-col gap-3 px-5 pt-2">
        {loading ? (
          <p className="text-center py-8" style={{ color: 'var(--bark-400)', fontFamily: 'var(--font-body)' }}>
            Loading...
          </p>
        ) : error ? (
          <p className="text-center py-8" style={{ color: 'var(--protea)', fontFamily: 'var(--font-body)' }}>
            {error}
          </p>
        ) : offerings.length === 0 ? (
          <div
            className="text-center py-8"
            style={{ color: 'var(--bark-400)', fontFamily: 'var(--font-body)' }}
          >
            {t('support.emptyState', 'Nothing here yet — check another kind of support.')}
          </div>
        ) : (
          offerings.map((o) => (
            <ProgrammeCard
              key={o.id}
              name={o.name}
              shortDescription={o.shortDescription}
              pillarTags={o.pillarTags}
              providerName={o.providerName}
              providerVerified={o.providerVerified}
              endorsementCount={o.endorsementCount}
              totalEndorsements={o.totalEndorsements}
              requestLabel={t('support.requestButton', 'Request for our community')}
              onRequest={() => setRequestOffering(o)}
            />
          ))
        )}
      </div>

      {/* Request form sheet */}
      {requestOffering && (
        <RequestForm
          offeringName={requestOffering.name}
          onSubmit={handleRequest}
          onCancel={() => setRequestOffering(null)}
          submitting={requestSubmitting}
          error={requestError}
        />
      )}
    </div>
  )
}
