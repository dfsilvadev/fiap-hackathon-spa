import type { Guardian } from '@/components/ui/user'
import { get } from '@/lib/axios'

export interface LevelBySubject {
  categoryId: string
  categoryName: string
  level: string
}

export interface PendingRecommendationSummary {
  id: string
  contentId: string
  contentTitle: string
  reason: string
  categoryName: string
}

export interface ProfessorDashboardStudent {
  id: string
  name: string
  email: string
  currentGrade: string
  levelsBySubject: LevelBySubject[]
  pendingRecommendations: PendingRecommendationSummary[]
  /**
   * Registration fields returned by dashboard routes
   * to avoid extra calls to /users/:id.
   */
  dateOfBirth?: string | null
  guardians?: Guardian[]
}

export interface ProfessorDashboardSubject {
  id: string
  name: string
}

export interface SummaryByGradeItem {
  grade: string
  totalStudents: number
  activeStudents: number
  contentsCount: number
  assessmentsCount: number
}

export interface SubjectGradeStats {
  grade: string
  contentsCount: number
  pathsCount: number
  assessmentsCount: number
}

export interface SubjectsByGradeItem {
  categoryId: string
  categoryName: string
  description?: string
  byGrade: SubjectGradeStats[]
}

export interface LearningPathItem {
  pathId: string
  title: string
  grade: string
  categoryId: string
  categoryName: string
  moduleCount: number
  studentCount: number
  completionPercentage: number
}

export interface ProfessorDashboardResponse {
  students: ProfessorDashboardStudent[]
  total: number
  subjects: ProfessorDashboardSubject[]
  summaryByGrade?: SummaryByGradeItem[]
  subjectsByGrade?: SubjectsByGradeItem[]
  learningPaths?: LearningPathItem[]
}

const basePath = '/dashboard/professor/students'

export const getProfessorDashboard = (currentGrade?: string) =>
  get<ProfessorDashboardResponse>(basePath, true, currentGrade ? { currentGrade } : undefined)
