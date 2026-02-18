import { get } from '@/lib/axios'

export interface LearningPathCategory {
  id: string
  name: string
}

export type LearningPathContentStatus = 'completed' | 'available' | 'blocked'

export interface LearningPathContent {
  id?: string
  contentId: string
  orderNumber: number
  title: string
  level: string
  status: LearningPathContentStatus
}

export interface LearningPath {
  id: string
  name: string
  categoryId: string
  category: LearningPathCategory
  grade: string
  description?: string
  contents?: LearningPathContent[]
}

const learningPathBase = '/learning-paths/for-student'

type LearningPathApiResponse = LearningPath | LearningPath[] | { learningPaths: LearningPath[] }

export const getForStudent = (categoryId: string) =>
  get<LearningPathApiResponse>(`${learningPathBase}?categoryId=${categoryId}`, true).then(
    (response) => response
  )
