// src/lib/api.ts
// Typed API client — reads session token from IndexedDB
import { getSession } from './session'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function getToken(): Promise<string | null> {
  const session = await getSession()
  return session?.token ?? null
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`)
  return res.json()
}

export const api = {
  get:    <T>(path: string)                => request<T>('GET', path),
  post:   <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put:    <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string)                => request<T>('DELETE', path),
}

import type {
  GiftsProfile, StewardDashboard, IsolateList, HubsData, NetworkSummary,
  MarketplaceOfferingsResponse, GrounderOfferingsResponse,
  GrounderRequestsResponse, RequestResponse,
} from './types'

export const giftsProfileApi = {
  get: () => api.get<GiftsProfile | null>('/gifts-profile/me'),
  put: (data: Partial<GiftsProfile>) =>
    api.put<GiftsProfile>('/gifts-profile/me', data),
}

export const stewardApi = {
  dashboard: (cellId: string) => api.get<StewardDashboard>(`/steward/dashboard/${cellId}`),
  isolates: (cellId: string) => api.get<IsolateList>(`/steward/isolates/${cellId}`),
  hubs: (cellId: string) => api.get<HubsData>(`/steward/hubs/${cellId}`),
  networkSummary: (cellId: string) => api.get<NetworkSummary>(`/steward/network-summary/${cellId}`),
  logOfflineTrade: (data: {
    cellId: string
    description: string
    pillar: string
    offeringParty: string
    needingParty: string
    date?: string
  }) => api.post<{ listingId: string; tradeCompletionId: string }>('/steward/log-offline-trade', data),
}

export const marketplaceApi = {
  browse: (pillar?: string, search?: string) => {
    const params = new URLSearchParams()
    if (pillar) params.set('pillar', pillar)
    if (search) params.set('search', search)
    const qs = params.toString()
    return api.get<MarketplaceOfferingsResponse>(`/marketplace/offerings${qs ? '?' + qs : ''}`)
  },

  request: (offeringId: string, requestContext: string) =>
    api.post<RequestResponse>(`/marketplace/offerings/${offeringId}/request`, { requestContext }),

  createOffering: (data: {
    name: string
    shortDescription?: string
    fullDescription?: string
    pillarTags: string[]
    communityRequirements?: string
    typicalDuration?: string
  }) => api.post('/marketplace/offerings', data),

  myOfferings: () =>
    api.get<GrounderOfferingsResponse>('/marketplace/offerings/mine'),

  updateOffering: (id: string, data: Record<string, unknown>) =>
    api.patch(`/marketplace/offerings/${id}`, data),

  requests: () =>
    api.get<GrounderRequestsResponse>('/marketplace/requests'),

  updateEngagement: (id: string, status: string) =>
    api.patch(`/marketplace/engagements/${id}`, { status }),

  endorse: (engagementId: string, recommend: boolean, note?: string, visibility?: string) =>
    api.post(`/marketplace/engagements/${engagementId}/endorse`, { recommend, note, visibility }),
}
