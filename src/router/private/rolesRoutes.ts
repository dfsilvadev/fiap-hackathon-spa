import {
  House,
  Path,
  UsersThree,
  BookOpen,
  Kanban,
  ClipboardText,
  Lightbulb,
  Icon,
} from '@phosphor-icons/react'
import { Routes } from '../constants/routesMap'

export type UserRole = 'student' | 'teacher' | 'coordinator'

interface MenuItem {
  label: string
  path: string
  roles: UserRole[]
  icon: Icon // Tipagem específica do Phosphor
}

const RolesRoutes: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    roles: ['student', 'teacher', 'coordinator'],
    icon: House,
  },
  { label: 'Minhas Trilhas', path: '/minhas-trilhas', roles: ['student'], icon: Path },
  { label: 'Usuários', path: '/usuarios', roles: ['teacher', 'coordinator'], icon: UsersThree },
  {
    label: 'Conteúdos',
    path: '/conteudos',
    roles: ['student', 'teacher', 'coordinator'],
    icon: BookOpen,
  },
  { label: 'Trilhas', path: '/trilhas', roles: ['teacher', 'coordinator'], icon: Kanban },
  {
    label: 'Avaliações',
    path: Routes.ASSESSMENTS,
    roles: ['teacher', 'coordinator'],
    icon: ClipboardText,
  },
  {
    label: 'Avaliações',
    path: Routes.ASSESSMENTS_STUDENT,
    roles: ['student'],
    icon: ClipboardText,
  },
  { label: 'Recomendações', path: '/recomendacoes', roles: ['student'], icon: Lightbulb },
]

export { RolesRoutes }
