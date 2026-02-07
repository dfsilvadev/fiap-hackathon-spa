import { get } from '../lib/axios'
import type { User } from '../components/ui/user'

const base = '/users'

export const getUserById = (id: string) => get<User>(base + `/${id}`, true)
