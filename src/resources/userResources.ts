import type { Guardian, User } from '../components/ui/user'
import { get, patch, post } from '../lib/axios'
import type { ProfessorDashboardStudent } from './professorDashboardResources'

const base = '/users'

/**
 * Supported student grades.
 * Keeps frontend values aligned with the backend enum.
 */
export type StudentGrade = '6' | '7' | '8' | '9' | '1EM' | '2EM' | '3EM'

/**
 * Payload for student creation (coordinator).
 * Based on backend CreateUserStudentInput.
 */
export interface CreateUserStudentInput {
  name: string
  email: string
  password: string
  role: 'student'
  currentGrade: StudentGrade
  guardians: Guardian[]
  /**
   * ISO date string - optional in backend.
   * Example: "2010-05-20"
   */
  dateOfBirth?: string
}

/**
 * Payload for student updates.
 * All fields are optional according to UpdateUserStudentInput.
 */
export interface UpdateUserStudentInput {
  name?: string
  email?: string
  currentGrade?: StudentGrade
  guardians?: Guardian[]
  dateOfBirth?: string | null
}

export interface ProfessorStudentsListResponse {
  students: ProfessorDashboardStudent[]
  page: number
  limit: number
  total: number
  totalPages?: number
}

/**
 * Lists teacher students with grade filters and pagination.
 * Endpoint: GET /api/dashboard/professor/students?currentGrade=&page=&limit=
 */
export const getProfessorStudents = (params?: {
  currentGrade?: StudentGrade
  page?: number
  limit?: number
}) => {
  const query: Record<string, string | number> = {}

  if (params?.currentGrade) query.currentGrade = params.currentGrade
  if (params?.page) query.page = params.page
  if (params?.limit) query.limit = params.limit

  return get<ProfessorStudentsListResponse>('/dashboard/professor/students', true, query)
}

export const getUserById = (id: string) => get<User>(`${base}/${id}`, true)

/**
 * Generic user update, already used by profile flows.
 */
export const updateUser = (id: string, data: Partial<User>) =>
  patch<User, Partial<User>>(`${base}/${id}`, data, true)

/**
 * Creates a new student.
 * Endpoint: POST /api/users
 */
export const createStudentUser = (data: CreateUserStudentInput) =>
  post<User, CreateUserStudentInput>(base, data, true)

/**
 * Updates a student (without password).
 * Endpoint: PATCH /api/users/:id
 */
export const updateStudentUser = (id: string, data: UpdateUserStudentInput) =>
  patch<User, UpdateUserStudentInput>(`${base}/${id}`, data, true)

/**
 * Activates/deactivates a student.
 * Endpoint: PATCH /api/users/:id/active
 */
export const toggleUserActive = (id: string, isActive: boolean) =>
  patch<User, { isActive: boolean }>(`${base}/${id}/active`, { isActive }, true)
