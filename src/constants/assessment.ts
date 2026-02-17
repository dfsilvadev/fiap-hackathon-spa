/**
 * Níveis de avaliação (1, 2 ou 3 — não existe avaliação de reforço).
 */
export const ASSESSMENT_LEVELS = ['1', '2', '3'] as const
export type AssessmentLevel = (typeof ASSESSMENT_LEVELS)[number]

export const ASSESSMENT_LEVEL_OPTIONS: { value: AssessmentLevel; label: string }[] = [
  { value: '1', label: 'Nível 1' },
  { value: '2', label: 'Nível 2' },
  { value: '3', label: 'Nível 3' },
]

/**
 * Tipos de questão.
 */
export const QUESTION_TYPES = ['multiple_choice', 'true_false', 'text'] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

export const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Múltipla escolha' },
  { value: 'true_false', label: 'Verdadeiro ou falso' },
  { value: 'text', label: 'Texto livre' },
]
