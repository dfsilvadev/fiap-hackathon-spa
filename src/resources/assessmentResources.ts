import { get } from '../lib/axios'
import type { Assessments } from '../components/ui/assessment'

const base = '/assessments'

export const getAll = () => get<Assessments>(base + '/available', true)
