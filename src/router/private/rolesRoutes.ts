//import {Routes} from '../constants/routesMap'

export type UserRole = 'student' | 'teacher' | 'coordinator'

interface MenuItem {
  label: string
  path: string
  roles: UserRole[]
}

// Configuração centralizada do menu
const RolesRoutes: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', roles: ['student', 'teacher', 'coordinator'] },
  { label: 'Minhas Trilhas', path: '/minhas-trilhas', roles: ['student'] },
  { label: 'Usuários', path: '/usuarios', roles: ['teacher', 'coordinator'] },
  { label: 'Conteúdos', path: '/conteudos', roles: ['student', 'teacher', 'coordinator'] },
  { label: 'Trilhas', path: '/trilhas', roles: ['teacher', 'coordinator'] },
  { label: 'Avaliações', path: '/avaliacoes', roles: ['student', 'teacher', 'coordinator'] },
  { label: 'Recomendações', path: '/recomendacoes', roles: ['student'] },
]

export { RolesRoutes }
