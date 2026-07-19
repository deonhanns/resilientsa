// src/lib/session.ts
// IndexedDB session storage — survives browser restarts, works offline
import { openDB } from 'idb'

const DB_NAME = 'resilientsa'
const STORE   = 'session'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    },
  })
}

export async function saveSession(token: string, userId: string, role: string): Promise<void> {
  const db = await getDB()
  await db.put(STORE, { token, userId, role, savedAt: Date.now() }, 'current')
}

export async function getSession(): Promise<{ token: string; userId: string; role: string } | null> {
  const db = await getDB()
  return (await db.get(STORE, 'current')) ?? null
}

export async function clearSession(): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, 'current')
}

export async function setDemoSession(): Promise<void> {
  await saveSession('demo-token', 'demo-user-id', 'cell_steward')
}
