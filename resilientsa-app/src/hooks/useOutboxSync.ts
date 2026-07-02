// src/hooks/useOutboxSync.ts
// Drains the outbox when connectivity returns, with exponential backoff
import { useEffect, useRef, useState } from 'react'
import { getOutbox, updateOutboxEntry, removeOutboxEntry, getPendingCount, type OutboxEntry } from '../lib/outbox'
import { useOfflineStatus } from './useOfflineStatus'

export function useOutboxSync() {
  const { isOnline } = useOfflineStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const syncing = useRef(false)

  // Update pending count whenever online status changes
  useEffect(() => {
    getPendingCount().then(setPendingCount)
  }, [isOnline])

  // Drain outbox when online
  useEffect(() => {
    if (!isOnline || syncing.current) return

    async function drain() {
      syncing.current = true
      const entries = await getOutbox()
      const pending = entries.filter(
        (e) => e.syncStatus === 'pending' || (e.syncStatus === 'failed' && e.retryCount < 5)
      )

      for (const entry of pending) {
        try {
          await updateOutboxEntry(entry.id, { syncStatus: 'syncing', retryCount: entry.retryCount })

          const token = await (async () => {
            // dynamic import to avoid circular deps
            const { getSession } = await import('../lib/session')
            const s = await getSession()
            return s?.token
          })()

          const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}${entry.endpoint}`, {
            method: entry.method,
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(entry.payload),
          })

          if (res.ok) {
            await removeOutboxEntry(entry.id)
          } else {
            await updateOutboxEntry(entry.id, {
              syncStatus: 'failed',
              retryCount: entry.retryCount + 1,
            })
          }
        } catch {
          await updateOutboxEntry(entry.id, {
            syncStatus: 'failed',
            retryCount: entry.retryCount + 1,
          })
        }
      }

      const remaining = await getPendingCount()
      setPendingCount(remaining)
      syncing.current = false
    }

    drain()
  }, [isOnline])

  return { isSyncing: syncing.current, pendingCount }
}

export type { OutboxEntry }
