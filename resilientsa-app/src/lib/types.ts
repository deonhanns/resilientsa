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

// --- Community Marketplace types (ORDER 008) ---

export interface MarketplaceOffering {
  id: string
  name: string
  shortDescription: string | null
  pillarTags: string[]
  providerName: string
  providerVerified: boolean
  endorsementCount: number
  totalEndorsements: number
  status: string
}

export interface MarketplaceOfferingsResponse {
  offerings: MarketplaceOffering[]
}

export interface GrounderOffering {
  id: string
  name: string
  shortDescription: string | null
  pillarTags: string[]
  status: string
  createdAt: string
  updatedAt: string
  engagementCount: number
}

export interface GrounderOfferingsResponse {
  offerings: GrounderOffering[]
}

export interface GrounderRequest {
  id: string
  offeringId: string
  offeringName: string
  nodeId: string
  nodeName: string
  requestContext: string | null
  requestedAt: string
  status: string
  startedAt: string | null
  completedAt: string | null
}

export interface GrounderRequestsResponse {
  requests: GrounderRequest[]
}

export interface RequestResponse {
  engagementId: string
  status: string
}

// --- Node & Cell Formation types (ORDER 009a) ---

export interface AdminNode {
  id: string
  name: string
  raCpfName: string | null
  healthState: string
  createdBy: string | null
  createdAt: string
}

export interface AdminNodesResponse {
  nodes: AdminNode[]
}

export interface AdminCell {
  id: string
  nodeId: string
  name: string
  stewardUserId: string | null
  stewardCompanionUserId: string | null
  createdAt: string
}

export interface AdminCellsResponse {
  cells: AdminCell[]
}

export interface AdminMember {
  id: string
  displayName: string
  role: string
  cellId: string | null
}

export interface AdminMembersResponse {
  members: AdminMember[]
}
