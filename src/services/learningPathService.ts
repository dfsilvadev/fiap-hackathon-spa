import { del, get, patch, post } from '@/lib/axios'

export interface LearningPathCategory {
  id: string
  name: string
}

/** Content item inside a learning path (GET detail response). */
export interface LearningPathContentItem {
  contentId: string
  orderNumber: number
  title: string
  level: string
}

/** Learning path item in GET /learning-paths listing. */
export interface LearningPathListItem {
  id: string
  name: string
  categoryId: string
  category: LearningPathCategory
  grade: string
  isDefault: boolean
  description: string | null
}

/** Learning path details from GET /learning-paths/:id (with contents). */
export interface LearningPathDetail extends LearningPathListItem {
  createdBy?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  contents: LearningPathContentItem[]
}

export interface LearningPathsListParams {
  categoryId?: string
  grade?: string
  page?: number
  limit?: number
}

export interface LearningPathsListResponse {
  paths: LearningPathListItem[]
  total: number
}

export interface CreateLearningPathPayload {
  name: string
  categoryId: string
  grade: string
  isDefault?: boolean
  description?: string
}

export interface UpdateLearningPathPayload {
  name?: string
  isDefault?: boolean
  description?: string
}

export interface AddContentToPathPayload {
  contentId: string
  orderNumber: number
}

export interface ReorderPathContentsPayload {
  items: Array<{ contentId: string; orderNumber: number }>
}

const base = '/learning-paths'

export const learningPathService = {
  getList: async (params?: LearningPathsListParams) => {
    const query: Record<string, string | number> = {}
    if (params?.categoryId) query.categoryId = params.categoryId
    if (params?.grade) query.grade = params.grade
    if (params?.page !== undefined) query.page = params.page
    if (params?.limit !== undefined) query.limit = params.limit
    const res = await get<LearningPathsListResponse>(base, true, query)
    return res.data
  },

  getById: async (id: string) => {
    const res = await get<LearningPathDetail>(`${base}/${id}`, true)
    return res.data
  },

  create: async (body: CreateLearningPathPayload) => {
    const res = await post<{ id: string; name: string }, CreateLearningPathPayload>(
      base,
      body,
      true
    )
    return res.data
  },

  update: async (id: string, body: UpdateLearningPathPayload) => {
    const res = await patch<{ id: string; name: string }, UpdateLearningPathPayload>(
      `${base}/${id}`,
      body,
      true
    )
    return res.data
  },

  addContent: async (pathId: string, body: AddContentToPathPayload) => {
    await post<unknown, AddContentToPathPayload>(`${base}/${pathId}/contents`, body, true)
  },

  removeContent: async (pathId: string, contentId: string) => {
    await del<unknown>(`${base}/${pathId}/contents/${contentId}`, true)
  },

  reorderContents: async (pathId: string, body: ReorderPathContentsPayload) => {
    await patch<unknown, ReorderPathContentsPayload>(
      `${base}/${pathId}/contents/reorder`,
      body,
      true
    )
  },
}
