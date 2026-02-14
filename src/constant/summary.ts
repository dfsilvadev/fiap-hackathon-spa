import { Path, ChartLine, Lightbulb, ClipboardText } from '@phosphor-icons/react'

export const SUMMARY = [
  {
    label: 'Trilhas ativas',
    value: '6',
    icon: Path,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    label: 'Conteúdos concluídos',
    value: '6',
    icon: ChartLine,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    label: 'Recomendações',
    value: '6',
    icon: Lightbulb,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  {
    label: 'Avaliações disponíveis',
    value: '6',
    icon: ClipboardText,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
]
