import { get, post } from '../lib/axios'
import type { LoginRequest, LoginResponse, UserAuth } from '../components/ui/auth'

export const sendLogin = (payload: LoginRequest) =>
  post<LoginResponse, LoginRequest>('/auth/login', payload, false)

export const getUserAuth = () => get<UserAuth>('/auth/me', false)

export const sendLogout = () => post<void>('/auth/logout')
