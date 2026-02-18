import { get, patch, post } from '@/lib/axios'

export interface ContentAuthor {
  name: string
  avatar?: string
  bio?: string
}

export interface ContentSection {
  sectionTitle: string
  html?: string
  markdown?: string
}

export interface ContentStatus {
  favorite?: boolean
  progress?: number // 0-100
  completed?: boolean
  lastViewedAt?: string
}

export interface ContentTopic {
  title: string
  content: string
}

// Base content shape used in both list and detail responses.
// Many fields are optional to keep the frontend resilient to API evolution.
export interface Content {
  id: string
  slug?: string

  // Core information
  title: string
  shortDescription?: string
  longDescription?: string
  coverImageUrl?: string
  type?: string // e.g. 'course', 'video', 'article'

  // Organization
  categoryId: string
  category: {
    id: string
    name: string
    description?: string
  }
  grade?: string
  level: string // '1' | '2' | '3' | 'reforco' | etc.

  // Learning content
  contentText: string
  sections?: ContentSection[]
  // Backend may return "topics": {} - handled as a topic dictionary.
  topics: Record<string, ContentTopic> | null
  // Backend may return "tags": {} - kept flexible intentionally.
  tags: string[] | Record<string, unknown> | null

  // Metadata and engagement
  durationMinutes?: number
  publishedAt?: string
  author?: ContentAuthor
  learningObjectives?: string[]
  targetAudience?: string
  prerequisites?: string[]
  estimatedCompletionMinutes?: number
  viewsCount?: number
  favoritesCount?: number
  averageRating?: number
  ratingsCount?: number

  // User state
  userStatus?: ContentStatus

  // Student availability status (GET /contents/for-student)
  status?: ProgressAvailabilityStatus

  // Relations
  relatedContents?: Array<
    Pick<Content, 'id' | 'slug' | 'title' | 'coverImageUrl' | 'type' | 'level'>
  >

  // Management fields for teacher/coordinator listing (GET /contents)
  userId?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  glossary?: Record<string, unknown> | null
  accessibilityMetadata?: Record<string, unknown> | null
}

interface ContentsResponse {
  contents: Content[]
  total: number
}

/** Query params for teacher/coordinator content listing. */
export interface ContentsListParams {
  categoryId?: string
  grade?: string
  level?: string
  isActive?: boolean
  page?: number
  limit?: number
}

/** Payload for creating content - POST /contents. */
export interface CreateContentPayload {
  title: string
  contentText: string
  categoryId: string
  grade: string
  level: string
  topics?: Record<string, ContentTopic> | Record<string, unknown>
  glossary?: Record<string, unknown>
  accessibilityMetadata?: Record<string, unknown>
  tags?: string[]
}

/** Payload for updating content - PATCH /contents/:id (all optional). */
export interface UpdateContentPayload {
  title?: string
  contentText?: string
  grade?: string
  level?: string
  topics?: Record<string, ContentTopic> | Record<string, unknown>
  glossary?: Record<string, unknown>
  accessibilityMetadata?: Record<string, unknown>
  tags?: string[]
}

export interface CategoryDto {
  id: string
  name: string
  description?: string
}

export type ProgressAvailabilityStatus = 'blocked' | 'available' | 'completed'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface ProgressContentItem {
  contentId: string
  title: string
  level: string
  status: ProgressAvailabilityStatus
  progressStatus: ProgressStatus
}

export interface CategoryProgressResponse {
  contents: ProgressContentItem[]
  currentLevel: string
  percentage: number
}

interface ContentProgressPayload {
  contentId: string
  status: 'not_started' | 'in_progress' | 'completed'
  timeSpent?: number
}

interface ContentProgress {
  id: string
  studentId: string
  contentId: string
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: string
  completedAt?: string
  timeSpent?: number
  createdAt: string
  updatedAt: string
}

export const contentService = {
  /**
   * Lists content visible to students.
   * Maps to GET /contents/for-student?categoryId=&page=&limit=
   */
  getContentsForStudent: async (options?: {
    categoryId?: string
    page?: number
    limit?: number
  }) => {
    const params: Record<string, string> = {}

    if (options?.categoryId) params.categoryId = options.categoryId
    if (options?.page) params.page = String(options.page)
    if (options?.limit) params.limit = String(options.limit)

    const queryParams = Object.keys(params).length > 0 ? params : undefined

    const response = await get<ContentsResponse>('/contents/for-student', true, queryParams)
    return response.data
  },

  /**
   * Gets student content details - GET /contents/:id.
   */
  getContentById: async (id: string) => {
    const response = await get<Content>(`/contents/${id}`, true)
    return response.data
  },

  /**
   * Marks content as completed for the logged-in student.
   * Endpoint: PATCH /progress
   */
  markContentCompleted: async (contentId: string, timeSpentSeconds = 1200) => {
    const body: ContentProgressPayload = {
      contentId,
      status: 'completed',
      timeSpent: Math.max(0, Math.floor(timeSpentSeconds)),
    }

    const response = await patch<ContentProgress, ContentProgressPayload>('/progress', body, true)

    return response.data
  },

  /**
   * Gets student progress by category (subject) - GET /progress?categoryId=
   */
  getProgressByCategory: async (categoryId: string) => {
    const response = await get<CategoryProgressResponse>('/progress', true, { categoryId })
    return response.data
  },

  /**
   * Lists content for teacher/coordinator.
   * GET /contents?categoryId=&grade=&level=&isActive=&page=&limit=
   * Teachers only see subjects they teach; coordinators see all.
   */
  getContents: async (params?: ContentsListParams) => {
    const query: Record<string, string | number | boolean> = {}
    if (params?.categoryId) query.categoryId = params.categoryId
    if (params?.grade) query.grade = params.grade
    if (params?.level) query.level = params.level
    if (params?.isActive !== undefined) query.isActive = params.isActive
    if (params?.page !== undefined) query.page = params.page
    if (params?.limit !== undefined) query.limit = params.limit
    const response = await get<ContentsResponse>('/contents', true, query)
    return response.data
  },

  /**
   * Gets categories/subjects for filters and form select.
   * GET /categories - backend can respond with:
   * - [ { id, name } ]
   * - { categories: [ { id, name } ] }
   */
  getCategories: async () => {
    const response = await get<CategoryDto[] | { categories: CategoryDto[] }>('/categories', true)
    const data = response.data

    if (Array.isArray(data)) return data
    if (data && Array.isArray((data as { categories?: CategoryDto[] }).categories)) {
      return (data as { categories: CategoryDto[] }).categories
    }

    return []
  },

  /**
   * Creates content - POST /contents.
   * Returns 403 if a teacher tries to create content for a subject they do not teach.
   */
  createContent: async (body: CreateContentPayload) => {
    const response = await post<Content, CreateContentPayload>('/contents', body, true)
    return response.data
  },

  /**
   * Updates content - PATCH /contents/:id.
   * Returns 403 when the user has no permission for the content subject.
   */
  updateContent: async (id: string, body: UpdateContentPayload) => {
    const response = await patch<Content, UpdateContentPayload>(`/contents/${id}`, body, true)
    return response.data
  },

  /**
   * Activates/deactivates content (soft delete) - PATCH /contents/:id/active.
   * Returns 204 with no body.
   */
  setContentActive: async (id: string, isActive: boolean) => {
    await patch<unknown, { isActive: boolean }>(`/contents/${id}/active`, { isActive }, true)
  },
}
