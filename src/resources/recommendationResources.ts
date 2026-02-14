import { get, patch } from '@/lib/axios'
import { logger } from '@/utils/loogers'

export type RecommendationStatus = 'pending' | 'completed' | 'dismissed'

export interface RecommendationContent {
  id: string
  title: string
  categoryName: string
  grade: string
  level: string
}

export interface Recommendation {
  id: string
  status: RecommendationStatus
  tags?: string[]
  createdAt: string
  content: RecommendationContent
  sourceType?: string
  reason?: string
}

const recommendationsBase = '/recommendations'

export const getRecommendations = (status?: RecommendationStatus) =>
  get<Recommendation[] | { recommendations: Recommendation[] }>(
    recommendationsBase,
    true,
    status ? { status } : undefined
  ).then((response) => {
    logger.debug('[Recommendations API] GET /recommendations response', response.data)
    return response
  })

export const updateRecommendationStatus = (id: string, status: RecommendationStatus) =>
  patch<Recommendation>(`${recommendationsBase}/${id}`, { status }, true)
