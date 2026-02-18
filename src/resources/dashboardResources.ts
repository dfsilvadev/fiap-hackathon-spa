import { get } from '../lib/axios'
import { DashboardStudent } from '../components/ui/dashboard'

const base = '/dashboard'

export const getByUser = () => get<DashboardStudent>(base + '/student', true)
