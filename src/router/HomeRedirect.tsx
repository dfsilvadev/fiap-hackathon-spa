import { Navigate } from 'react-router'

import { useAuth } from '@/hooks/useAuth'
import { Routes as RoutePaths } from './constants/routesMap'

const HomeRedirect = () => {
  const { isLoggedIn, me } = useAuth()
  const isProfessorOrCoordinator =
    isLoggedIn && me && (me.role === 'teacher' || me.role === 'coordinator')

  return <Navigate to={isProfessorOrCoordinator ? RoutePaths.DASHBOARD : RoutePaths.HOME} replace />
}

export default HomeRedirect
