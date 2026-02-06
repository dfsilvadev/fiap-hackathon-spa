import { useState, useEffect, useCallback } from 'react'
import type { User } from '../components/ui/user'
import type { LoginResponse, UserAuth } from '../components/ui/auth'
import { getUserAuth, sendLogout } from '@/resources/authResources'
import { getUserById } from '@/resources/userResources'

type UseAuthReturn = {
  isLoggedIn: boolean
  user: User | null
  me: UserAuth | null
  login: (response: LoginResponse) => void
  logout: () => void
}

const TOKEN_KEY = 'token'
const USER_AUTH_KEY = 'userAuth'
const USER_KEY = 'user'

function safeParseUserAuth(value: string | null): UserAuth | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    if (
      typeof parsed.sub === 'string' &&
      typeof parsed.role === 'string' &&
      typeof parsed.iat === 'number' &&
      typeof parsed.exp === 'number'
    ) {
      return parsed as UserAuth
    }
    return null
  } catch {
    return null
  }
}

type Guardian = {
  name: string
  email: string
  phone: string
  relationship: string
}

function safeParseUser(value: string | null): User | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    if (
      typeof parsed.id === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.role === 'string' &&
      typeof parsed.roleId === 'string' &&
      typeof parsed.isActive === 'boolean' &&
      typeof parsed.createdAt === 'string' &&
      typeof parsed.updatedAt === 'string' &&
      (parsed.dateOfBirth === null || typeof parsed.dateOfBirth === 'string') &&
      (parsed.currentGrade === null || typeof parsed.currentGrade === 'string') &&
      (parsed.phone === null || typeof parsed.phone === 'string') &&
      Array.isArray(parsed.guardians) &&
      parsed.guardians.every(
        (g: Guardian) =>
          typeof g.name === 'string' &&
          typeof g.email === 'string' &&
          typeof g.phone === 'string' &&
          typeof g.relationship === 'string'
      )
    ) {
      return parsed as User
    }
    return null
  } catch {
    return null
  }
}

export function useAuth(): UseAuthReturn {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(TOKEN_KEY))
  const [me, setMe] = useState<UserAuth | null>(() =>
    safeParseUserAuth(localStorage.getItem(USER_AUTH_KEY))
  )
  const [user, setUser] = useState<User | null>(() => safeParseUser(localStorage.getItem(USER_KEY)))

  const login = useCallback(async (response: LoginResponse) => {
    const { accessToken } = response

    localStorage.setItem(TOKEN_KEY, accessToken)

    const userAuthResponse = await getUserAuth()
    const userAuth: UserAuth = userAuthResponse.data
    const { sub } = userAuth

    localStorage.setItem(USER_AUTH_KEY, JSON.stringify(userAuth))

    try {
      const userResponse = await getUserById(sub)
      const userData = userResponse.data

      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      setUser(null)
    }

    setIsLoggedIn(true)
  }, [])

  const logout = useCallback(async () => {
    try {
      await sendLogout()
    } catch (error) {
      console.error('Failed to send logout:', error)
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_AUTH_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    setIsLoggedIn(false)
    window.location.reload()
  }, [])

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) setIsLoggedIn(!!e.newValue)
      if (e.key === USER_AUTH_KEY) setMe(safeParseUserAuth(e.newValue))
      if (e.key === USER_KEY) setUser(safeParseUser(e.newValue))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return { isLoggedIn, user, me, login, logout }
}
