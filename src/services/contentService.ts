import { get } from '@/lib/axios'

export interface Content {
  id: string
  title: string
  contentText: string
  categoryId: string
  category: {
    id: string
    name: string
  }
  grade: string
  level: string 
  topics: string[] | null
  tags: string[] | null
}

interface ContentsResponse {
  contents: Content[]
  total: number
}

export const contentService = {
  getContentsForStudent: async (categoryId?: string) => {
    // Definimos o tipo explicitamente para evitar o erro de 'undefined' no Record
    const params: Record<string, string> = {}
    if (categoryId) params.categoryId = categoryId
    
    // Se o objeto estiver vazio, passamos undefined para o axios
    const queryParams = Object.keys(params).length > 0 ? params : undefined

    const response = await get<ContentsResponse>('/api/contents/for-student', true, queryParams)
    return response.data
  },

  getContentById: async (id: string) => {
    const response = await get<Content>(`/api/contents/${id}`, true)
    return response.data
  }
}