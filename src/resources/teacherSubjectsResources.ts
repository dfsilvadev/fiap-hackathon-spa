import { get } from '@/lib/axios'

export interface TeacherSubject {
  id: string
  name: string
  contentsCount: number
  pathsCount: number
}

export interface TeacherSubjectsResponse {
  subjects: TeacherSubject[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const basePath = '/teachers/subjects'

export const getTeacherSubjects = (page = 1, limit = 10) =>
  get<TeacherSubjectsResponse>(basePath, true, { page, limit })
