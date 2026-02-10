import { get, post } from '../lib/axios'
import type {
  Assessments,
  AssessmentDetail,
  SubmitAssessmentPayload,
  AssessmentResult,
} from '../components/ui/assessment'

const base = '/assessments'

export const getAll = () => get<Assessments>(base + '/available', true)

export const getById = (id: string) => get<AssessmentDetail>(base + `/${id}/for-student`, true)

export const submitAssessment = (id: string, payload: SubmitAssessmentPayload) =>
  post<AssessmentResult>(base + `/${id}/submit`, payload, true)
