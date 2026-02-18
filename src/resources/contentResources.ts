import { get } from '@/lib/axios'

export interface Content {
  id: string
  title: string
  subject: string
  excerpt: string
  fullText?: string
  topics?: string[]
  glossary?: { term: string; definition: string }[]
}

const contentsBase = '/contents'

export const getContents = () => get<Content[]>(contentsBase, true)

export const getContentById = (id: string) => get<Content>(`${contentsBase}/${id}`, true)
