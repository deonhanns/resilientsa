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
