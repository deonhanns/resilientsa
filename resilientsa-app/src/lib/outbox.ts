// src/lib/outbox.ts
// Offline-first Outbox pattern — queues writes when offline, syncs on reconnect
import { openDB } from 'idb'

const DB_NAME = 'resilientsa'
const STORE   = 'outbox'

export interface OutboxEntry {
  id:          string
  endpoint:    string
  method:      string
  payload:     unknown
  createdAt:   number
  syncStatus:  'pending' | 'syncing' | 'synced' | 'failed'
  retryCount:  number
}

async function getDB() {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
      // V1→V2: add outbox store alongside session (if upgrading from V1)
    },
  })
}

export async function addToOutbox(
  endpoint: string,
  method: string,
  payload: unknown
): Promise<string> {
  const db = await getDB()
  const id = crypto.randomUUID()
  const entry: OutboxEntry = {
    id,
    endpoint,
    method,
    payload,
    createdAt: Date.now(),
    syncStatus: 'pending',
    retryCount: 0,
  }
  await db.put(STORE, entry)
  return id
}

export async function getOutbox(): Promise<OutboxEntry[]> {
  const db = await getDB()
  return (await db.getAll(STORE)).sort((a, b) => a.createdAt - b.createdAt)
}

export async function updateOutboxEntry(
  id: string,
  updates: Partial<Pick<OutboxEntry, 'syncStatus' | 'retryCount'>>
): Promise<void> {
  const db = await getDB()
  const entry = await db.get(STORE, id)
  if (entry) {
    Object.assign(entry, updates)
    await db.put(STORE, entry)
  }
}

export async function removeOutboxEntry(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
}

export async function getPendingCount(): Promise<number> {
  const all = await getOutbox()
  return all.filter((e) => e.syncStatus === 'pending' || e.syncStatus === 'syncing').length
}
