import {
  BookOpen,
  ClipboardText,
  House,
  Icon,
  Lightbulb,
  Path,
  UsersIcon,
} from '@phosphor-icons/react'
import { Routes } from '../constants/routesMap'

export type UserRole = 'student' | 'teacher' | 'coordinator'

interface MenuItem {
  label: string
  path: string
  roles: UserRole[]
  icon: Icon
}

const RolesRoutes: MenuItem[] = [
  {
    label: 'Dashboard',
    path: Routes.DASHBOARD,
    roles: ['student', 'teacher', 'coordinator'],
    icon: House,
  },
  {
    label: 'Minhas Trilhas',
    path: Routes.STUDENT_TRIALS,
    roles: ['student'],
    icon: Path,
  },
  {
    label: 'Conteúdo',
    path: Routes.CONTENTS,
    roles: ['student'],
    icon: BookOpen,
  },
  {
    label: 'Avaliações',
    path: Routes.ASSESSMENTS_STUDENT,
    roles: ['student'],
    icon: ClipboardText,
  },
  {
    label: 'Recomendações',
    path: Routes.RECOMMENDATIONS,
    roles: ['student'],
    icon: Lightbulb,
  },
  {
    label: 'Usuários',
    path: Routes.USERS,
    roles: ['teacher', 'coordinator'],
    icon: UsersIcon,
  },
  {
    label: 'Conteúdos',
    path: Routes.CONTENTS,
    roles: ['teacher', 'coordinator'],
    icon: BookOpen,
  },
  {
    label: 'Trilhas',
    path: Routes.TRIALS,
    roles: ['teacher', 'coordinator'],
    icon: Path,
  },
  {
    label: 'Avaliações',
    path: Routes.ASSESSMENTS,
    roles: ['teacher', 'coordinator'],
    icon: ClipboardText,
  },
]

export { RolesRoutes }
