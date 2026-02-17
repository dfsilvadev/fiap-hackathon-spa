import { get, patch } from '../lib/axios'
import type { User } from '../components/ui/user'

const base = '/users'

export const getUserById = (id: string) => get<User>(base + `/${id}`, true)

export const updateUser = (id: string, data: Partial<User>) =>
  patch<User, Partial<User>>(`${base}/${id}`, data, true)
