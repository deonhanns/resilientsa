// src/lib/types.ts
// Shared TypeScript types for the ResilientSA frontend

export interface GiftsProfile {
  id:              string
  userId:          string
  lovesToDo:       string | null
  naturallyGoodAt: string | null
  caresDeeplyAbout: string | null
  freeTextGifts:   string | null
  updatedAt:       string
}

// --- Steward Dashboard types (ORDER 007) ---

export interface MemberRow {
  id: string
  displayName: string
  role: string
  recentConnections: number
  giftsProfile: {
    lovesToDo: string | null
    caresDeeplyAbout: string | null
  } | null
}

export interface NeedsRadarData {
  [pillar: string]: number
}

export interface ReciprocityFlag {
  memberId: string
  name: string
  direction: 'giving' | 'receiving'
  ratio: number
}

export interface StewardDashboard {
  cellName: string
  members: MemberRow[]
  needsRadar: NeedsRadarData
  recentActivity: {
    newListings: number
    completedTrades: number
    newConnections: number
  }
  reciprocityFlags: ReciprocityFlag[]
}

export interface IsolateMember {
  id: string
  displayName: string
  lastActive: string | null
  daysSinceLastConnection: number
  giftsProfile: {
    lovesToDo: string | null
    caresDeeplyAbout: string | null
  } | null
}

export interface IsolateList {
  isolates: IsolateMember[]
  count: number
  lastChecked: string
}

export interface HubMember {
  id: string
  displayName: string
  connectionCount: number
  risk: 'none' | 'attention' | 'concern'
}

export interface HubsData {
  hubs: HubMember[]
  burnoutRisk: boolean
}

export interface NetworkSummary {
  phase: string
  trend: string
  message: string
  stat: string
  lastUpdated: string
}
