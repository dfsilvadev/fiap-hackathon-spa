import { getUserAuth, sendLogout } from '@/resources/authResources'
import { getUserById } from '@/resources/userResources'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { LoginResponse, UserAuth } from '../components/ui/auth'
import type { User } from '../components/ui/user'
import { Routes } from '../router/constants/routesMap'

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
    let parsed = JSON.parse(value)

    if (parsed.user) {
      parsed = parsed.user
    }

    if (typeof parsed.sub === 'string' && typeof parsed.role === 'string') {
      return parsed as UserAuth
    }
    return null
  } catch {
    return null
  }
}

function safeParseUser(value: string | null): User | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    if (
      typeof parsed.id === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.role === 'string'
    ) {
      return parsed as User
    }
    return null
  } catch {
    return null
  }
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(TOKEN_KEY))
  const [me, setMe] = useState<UserAuth | null>(() =>
    safeParseUserAuth(localStorage.getItem(USER_AUTH_KEY))
  )
  const [user, setUser] = useState<User | null>(() => safeParseUser(localStorage.getItem(USER_KEY)))

  const login = useCallback(
    async (response: LoginResponse) => {
      const { accessToken } = response

      localStorage.setItem(TOKEN_KEY, accessToken)

      const userAuthResponse = await getUserAuth()

      const rawData = userAuthResponse.data as unknown as { user: UserAuth }

      const userAuth = rawData.user

      const sub = userAuth.sub

      console.log('Sub extraído:', sub)

      localStorage.setItem(USER_AUTH_KEY, JSON.stringify(userAuth))
      setMe(userAuth)

      try {
        const userResponse = await getUserById(sub)
        const userData = userResponse.data
        console.log('Fetched user data:', userResponse.data)

        localStorage.setItem(USER_KEY, JSON.stringify(userData))
        setUser(userData)
        const role = userAuth?.role
        if (role === 'teacher' || role === 'coordinator') {
          navigate(Routes.DASHBOARD)
        } else {
          navigate(Routes.HOME)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        setUser(null)
      }

      setIsLoggedIn(true)
    },
    [navigate]
  )

  const logout = useCallback(async () => {
    try {
      await sendLogout()
    } catch (error) {
      console.error('Failed to send logout:', error)
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_AUTH_KEY)
      localStorage.removeItem(USER_KEY)

      setUser(null)
      setMe(null)
      setIsLoggedIn(false)

      navigate(Routes.SIGN_IN)
    }
  }, [navigate])

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
