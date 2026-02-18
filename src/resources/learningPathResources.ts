import { get } from '@/lib/axios'

export interface LearningPath {
  id: string
  name: string
  categoryId: string
  category: string
  grade: string
  description?: string
  content?: LearningPathContent[]
}

export interface LearningPathContent {
  id: string
  contentId: string
  orderNumber: string
  title: string
  level: string
  status: string
}

const learningPathBase = '/learning-paths/for-student'

export const getForStudent = (categoryId: string) =>
  get<LearningPath[] | { learningPaths: LearningPath[] }>(
    `${learningPathBase}?categoryId=${categoryId}`,
    true
  ).then((response) => {
    return response
  })
