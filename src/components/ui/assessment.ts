import { Category } from './category'

export interface Assessments {
  id: string
  title: string
  description: string | null
  categoryId: string
  level: string
  minScore: unknown
  startDate: Date
  endDate: Date | null
  category?: Category | undefined
}
