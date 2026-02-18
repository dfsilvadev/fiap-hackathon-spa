/**
 * Séries aceitas para conteúdo (alinhado ao backend).
 */
export const CONTENT_GRADES = ['6', '7', '8', '9', '1EM', '2EM', '3EM'] as const
export type ContentGrade = (typeof CONTENT_GRADES)[number]

/**
 * Níveis de aprendizagem (obrigatório por conteúdo).
 * "reforco" = conteúdo de reforço, não entra na trilha padrão.
 */
export const CONTENT_LEVELS = ['1', '2', '3', 'reforco'] as const
export type ContentLevel = (typeof CONTENT_LEVELS)[number]

export const CONTENT_GRADE_OPTIONS: { value: ContentGrade; label: string }[] = [
  { value: '6', label: '6º ano' },
  { value: '7', label: '7º ano' },
  { value: '8', label: '8º ano' },
  { value: '9', label: '9º ano' },
  { value: '1EM', label: '1º EM' },
  { value: '2EM', label: '2º EM' },
  { value: '3EM', label: '3º EM' },
]

export const CONTENT_LEVEL_OPTIONS: { value: ContentLevel; label: string }[] = [
  { value: '1', label: 'Nível 1' },
  { value: '2', label: 'Nível 2' },
  { value: '3', label: 'Nível 3' },
  { value: 'reforco', label: 'Reforço' },
]
