import { BookOpen, ClipboardText, House, Lightbulb, Path, Icon } from '@phosphor-icons/react'
import { Routes } from '../constants/routesMap'

interface MenuItem {
  label: string
  path: string
  roles: string[]
  icon: Icon // Define o tipo como Icon para remover o erro de lint
}

const RolesRoutes: MenuItem[] = [
  { label: 'Dashboard', path: Routes.HOME, roles: ['student'], icon: House },
  { label: 'Minhas Trilhas', path: Routes.STUDENT_TRIALS, roles: ['student'], icon: Path },
  { label: 'Conteúdos', path: Routes.CONTENTS, roles: ['student'], icon: BookOpen },
  { label: 'Avaliações', path: Routes.ASSESSMENTS_STUDENT, roles: ['student'], icon: ClipboardText },
  { label: 'Recomendações', path: Routes.RECOMMENDATIONS, roles: ['student'], icon: Lightbulb },
]

export { RolesRoutes }