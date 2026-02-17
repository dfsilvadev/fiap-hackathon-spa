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

  // Gestão (professor/coordenador) – listagem GET /contents
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

/** Query params para listagem de conteúdos (professor/coordenador) */
export interface ContentsListParams {
  categoryId?: string
  grade?: string
  level?: string
  isActive?: boolean
  page?: number
  limit?: number
}

/** Payload de criação de conteúdo – POST /contents */
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

/** Payload de edição – PATCH /contents/:id (todos opcionais) */
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

  // ----- Gestão (professor/coordenador) -----

  /**
   * Listagem de conteúdos para professor/coordenador.
   * GET /contents?categoryId=&grade=&level=&isActive=&page=&limit=
   * Professor vê só conteúdos das matérias que leciona; coordenador vê todos.
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
   * Categorias/matérias – para filtros e select no formulário.
   * GET /categories (se o backend expuser). Caso contrário use getTeacherSubjects para professor.
   */
  getCategories: async () => {
    const response = await get<CategoryDto[]>('/categories', true)
    return Array.isArray(response.data) ? response.data : []
  },

  /**
   * Criar conteúdo – POST /contents.
   * 403 se professor tentar criar para matéria que não leciona.
   */
  createContent: async (body: CreateContentPayload) => {
    const response = await post<Content, CreateContentPayload>('/contents', body, true)
    return response.data
  },

  /**
   * Atualizar conteúdo – PATCH /contents/:id.
   * 403 se sem permissão sobre a matéria do conteúdo.
   */
  updateContent: async (id: string, body: UpdateContentPayload) => {
    const response = await patch<Content, UpdateContentPayload>(`/contents/${id}`, body, true)
    return response.data
  },

  /**
   * Ativar/desativar conteúdo (soft delete) – PATCH /contents/:id/active.
   * Resposta 204 sem body.
   */
  setContentActive: async (id: string, isActive: boolean) => {
    await patch<unknown, { isActive: boolean }>(`/contents/${id}/active`, { isActive }, true)
  },
}
