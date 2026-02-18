import { Path, ChartLine, Lightbulb, ClipboardText, Icon } from '@phosphor-icons/react'

export interface SummaryConfig {
  label: string
  icon: Icon
  color: string
  bg: string
  key: 'activePaths' | 'completedContents' | 'recommendations' | 'availableContents'
}

export const SUMMARY_CONFIG: SummaryConfig[] = [
  {
    label: 'Trilhas ativas',
    icon: Path,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    key: 'activePaths',
  },
  {
    label: 'Conteúdos concluídos',
    icon: ChartLine,
    color: 'text-green-600',
    bg: 'bg-green-100',
    key: 'completedContents',
  },
  {
    label: 'Recomendações',
    icon: Lightbulb,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    key: 'recommendations',
  },
  {
    label: 'Conteúdos disponíveis',
    icon: ClipboardText,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    key: 'availableContents',
  },
]
