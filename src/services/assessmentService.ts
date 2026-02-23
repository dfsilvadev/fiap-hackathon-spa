import { del, get, patch, post } from '@/lib/axios'

export interface AssessmentCategory {
  id: string
  name: string
}

/** Assessment item returned by GET /assessments. */
export interface AssessmentListItem {
  id: string
  title: string
  description: string | null
  categoryId: string
  contentId?: string
  category?: AssessmentCategory
  grade: string
  level: string
  minScore?: number
  startDate: string
  endDate: string | null
  isActive?: boolean
}

/** Question item (list endpoint may omit correctAnswer for security reasons). */
export interface AssessmentQuestionItem {
  id: string
  questionText: string
  questionType: string
  options?: string[] | Record<string, unknown>
  points?: number
  tags?: string[]
  orderNumber: number
  correctAnswer?: string
}

/** Assessment details returned by GET /assessments/:id (with questions). */
export interface AssessmentDetailDto extends AssessmentListItem {
  questions?: AssessmentQuestionItem[]
}

export interface AssessmentsListParams {
  categoryId?: string
  level?: string
  page?: number
  limit?: number
}

export interface AssessmentsListResponse {
  assessments: AssessmentListItem[]
  total: number
}

export interface CreateAssessmentPayload {
  title: string
  categoryId: string
  contentId: string
  grade: string
  level: string
  startDate: string
  description?: string
  minScore?: number
  endDate?: string
  isActive?: boolean
}

export interface UpdateAssessmentPayload {
  title?: string
  description?: string
  minScore?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export interface CreateQuestionPayload {
  questionText: string
  questionType: string
  correctAnswer: string
  orderNumber: number
  options?: string[] | Record<string, unknown>
  points?: number
  tags?: string[]
}

export interface UpdateQuestionPayload {
  questionText?: string
  questionType?: string
  correctAnswer?: string
  orderNumber?: number
  options?: string[] | Record<string, unknown>
  points?: number
  tags?: string[]
}

const base = '/assessments'

export const assessmentService = {
  getList: async (params?: AssessmentsListParams) => {
    const query: Record<string, string | number> = {}
    if (params?.categoryId) query.categoryId = params.categoryId
    if (params?.level) query.level = params.level
    if (params?.page !== undefined) query.page = params.page
    if (params?.limit !== undefined) query.limit = params.limit
    const res = await get<AssessmentsListResponse>(base, true, query)
    return res.data
  },

  getById: async (id: string) => {
    const res = await get<AssessmentDetailDto>(`${base}/${id}`, true)
    return res.data
  },

  getQuestions: async (id: string) => {
    const res = await get<AssessmentQuestionItem[]>(`${base}/${id}/questions`, true)
    return res.data
  },

  create: async (body: CreateAssessmentPayload) => {
    const res = await post<{ id: string; title: string }, CreateAssessmentPayload>(base, body, true)
    return res.data
  },

  update: async (id: string, body: UpdateAssessmentPayload) => {
    const res = await patch<{ id: string; title: string }, UpdateAssessmentPayload>(
      `${base}/${id}`,
      body,
      true
    )
    return res.data
  },

  createQuestion: async (assessmentId: string, body: CreateQuestionPayload) => {
    const res = await post<{ id: string; questionText: string }, CreateQuestionPayload>(
      `${base}/${assessmentId}/questions`,
      body,
      true
    )
    return res.data
  },

  updateQuestion: async (assessmentId: string, questionId: string, body: UpdateQuestionPayload) => {
    const res = await patch<{ id: string; questionText: string }, UpdateQuestionPayload>(
      `${base}/${assessmentId}/questions/${questionId}`,
      body,
      true
    )
    return res.data
  },

  deleteQuestion: async (assessmentId: string, questionId: string) => {
    await del<unknown>(`${base}/${assessmentId}/questions/${questionId}`, true)
  },
}
