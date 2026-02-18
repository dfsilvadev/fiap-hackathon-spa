import { get, patch, post } from '../lib/axios'
import type { User, Guardian } from '../components/ui/user'
import type { ProfessorDashboardStudent } from './professorDashboardResources'

const base = '/users'

/**
 * Séries suportadas para alunos.
 * Mantém o frontend alinhado com o enum do backend.
 */
export type StudentGrade = '6' | '7' | '8' | '9' | '1EM' | '2EM' | '3EM'

/**
 * Payload de criação de aluno (coordenador).
 * Baseado em CreateUserStudentInput do backend.
 */
export interface CreateUserStudentInput {
  name: string
  email: string
  password: string
  role: 'student'
  currentGrade: StudentGrade
  guardians: Guardian[]
  /**
   * ISO string – opcional no backend.
   * Ex.: "2010-05-20"
   */
  dateOfBirth?: string
}

/**
 * Payload de atualização de aluno.
 * Todos os campos são opcionais conforme UpdateUserStudentInput.
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
 * Lista de alunos do professor com filtros de série e paginação.
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
 * Atualização genérica de usuário – já usada no perfil.
 */
export const updateUser = (id: string, data: Partial<User>) =>
  patch<User, Partial<User>>(`${base}/${id}`, data, true)

/**
 * Criação de um novo aluno.
 * Endpoint: POST /api/users
 */
export const createStudentUser = (data: CreateUserStudentInput) =>
  post<User, CreateUserStudentInput>(base, data, true)

/**
 * Atualização específica de aluno (sem senha).
 * Endpoint: PATCH /api/users/:id
 */
export const updateStudentUser = (id: string, data: UpdateUserStudentInput) =>
  patch<User, UpdateUserStudentInput>(`${base}/${id}`, data, true)

/**
 * Ativar/desativar aluno.
 * Endpoint: PATCH /api/users/:id/active
 */
export const toggleUserActive = (id: string, isActive: boolean) =>
  patch<User, { isActive: boolean }>(`${base}/${id}/active`, { isActive }, true)
