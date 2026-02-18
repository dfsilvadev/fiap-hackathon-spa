import { formatDate } from '../../../util/formatDate'
import { Assessments } from '../../ui/assessment'
import { AssessmentCard } from './assessmentCard'

interface AssessmentListProps {
  data: Assessments[]
  onStartItem: (id: string) => void
}

export const AssessmentList = ({ data, onStartItem }: AssessmentListProps) => {
  if (data.length === 0) {
    return (
      <div className="mt-10 py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400 italic">Sem avaliação disponível no momento.</p>
      </div>
    )
  }

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item) => (
        <AssessmentCard
          key={item.id}
          id={item.id}
          category={item.category?.name || 'Geral'}
          title={item.title}
          description={item.description || 'Sem descrição disponível.'}
          level={item.level}
          minScore={item.minScore ? String(item.minScore) : '0'}
          startDate={formatDate(item.startDate)}
          endDate={item.endDate ? formatDate(item.endDate) : 'Sem data de término'}
          onStart={onStartItem}
        />
      ))}
    </div>
  )
}
