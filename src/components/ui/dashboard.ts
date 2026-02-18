import { Category } from './category'

export interface DashboardStudent {
  grade: string
  pathsBySubject: PathsBySubject[]
  pendingRecommendations: PendingRecommendations[]
}

export interface PendingRecommendations {
  id: string
  contentId: string
  reason: string
  content: Contents
}

export interface PathsBySubject {
  categoryId: string
  category: Category
  pathId: string
  pathName: string
  grade: string
  currentLevel: string
  totalContents: number
  completedCount: number
  percentage: number
  contents: Contents[]
}

export interface Contents {
  contentId: string
  title: string
  level: string
  status: 'blocked' | 'available' | 'completed'
  progressStatus: string
  completedAt: Date | null
}
