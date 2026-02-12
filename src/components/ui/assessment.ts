import { Category } from './category'

export interface Assessments {
  id: string
  title: string
  description: string | null
  categoryId: string
  level: string
  minScore: unknown
  startDate: Date
  endDate: Date | null
  category?: Category | undefined
}

export interface AssessmentDetail extends Assessments {
  questions: Question[]
}

export interface Question {
  id: string
  questionText: string
  questionType: string
  options: unknown[]
  points: number
  tags: string[]
  orderNumber: number
}

export interface MultipleChoice {
  id: number
  text: string
}

export interface AnswerItem {
  questionId: string
  answerText: string
}

export interface SubmitAssessmentPayload {
  answers: AnswerItem[]
}

export interface AssessmentResult {
  totalScore: number
  maxScore: number
  percentage: number
  levelUpdated: boolean
}

export interface AssessmentResultDetail {
  result: {
    totalScore: number
    maxScore: number
    percentage: number
    levelUpdated: boolean
    completedAt: string
  }
  assessment: {
    id: string
    title: string
    description: string
    category: {
      id: string
      name: string
    }
    level: string
  }
  questions: QuestionWithResult[]
}

export interface QuestionWithResult extends Question {
  correctAnswer: string
  studentAnswer: {
    answerText: string
    isCorrect: boolean
    pointsEarned: number
  }
}
