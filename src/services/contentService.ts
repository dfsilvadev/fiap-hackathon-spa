import { get, patch } from '@/lib/axios'

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
  progress?: number // 0–100
  completed?: boolean
  lastViewedAt?: string
}

export interface ContentTopic {
  title: string
  content: string
}

// Estrutura base de conteúdo – usada tanto na lista quanto no detalhe.
// Muitos campos são opcionais para permitir evolução da API sem quebrar o frontend.
export interface Content {
  id: string
  slug?: string

  // Informações principais
  title: string
  shortDescription?: string
  longDescription?: string
  coverImageUrl?: string
  type?: string // ex.: 'curso', 'video', 'artigo'

  // Organização
  categoryId: string
  category: {
    id: string
    name: string
    description?: string
  }
  grade?: string
  level: string // '1' | '2' | '3' | 'reforco' | etc.

  // Conteúdo pedagógico
  contentText: string
  sections?: ContentSection[]
  // backend devolve "topics": {} – tratamos como dicionário de tópicos
  topics: Record<string, ContentTopic> | null
  // backend hoje envia "tags": {} – mantemos flexível
  tags: string[] | Record<string, unknown> | null

  // Metadados e engajamento
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

  // Estado do usuário
  userStatus?: ContentStatus

  // Relações
  relatedContents?: Array<
    Pick<Content, 'id' | 'slug' | 'title' | 'coverImageUrl' | 'type' | 'level'>
  >
}

interface ContentsResponse {
  contents: Content[]
  total: number
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
   * Lista de conteúdos visíveis para o aluno.
   * Bate diretamente com o endpoint GET /contents/for-student?categoryId=&page=&limit=
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

    // Usa exatamente a rota exposta pelo backend para o aluno
    const response = await get<ContentsResponse>('/contents/for-student', true, queryParams)
    return response.data // { contents, total }
  },

  /**
   * Detalhe de um conteúdo para o aluno – GET /contents/:id
   */
  getContentById: async (id: string) => {
    const response = await get<Content>(`/contents/${id}`, true)
    return response.data
  },

  /**
   * Marca um conteúdo como concluído para o aluno logado.
   * Endpoint: PATCH /progress
   */
  markContentCompleted: async (contentId: string, timeSpentSeconds = 1200) => {
    const body: ContentProgressPayload = {
      contentId,
      status: 'completed',
      // backend espera inteiro em segundos
      timeSpent: Math.max(0, Math.floor(timeSpentSeconds)),
    }

    const response = await patch<ContentProgress, ContentProgressPayload>('/progress', body, true)

    return response.data
  },

  /**
   * Progresso do aluno por categoria (matéria) – GET /progress?categoryId=
   */
  getProgressByCategory: async (categoryId: string) => {
    const response = await get<CategoryProgressResponse>('/progress', true, { categoryId })
    return response.data
  },
}
